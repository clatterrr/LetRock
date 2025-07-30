// DOM元素
const testConnectionBtn = document.getElementById('testConnection');
const uploadFilesBtn = document.getElementById('uploadFiles');
const refreshFilesBtn = document.getElementById('refreshFiles');
const fileInput = document.getElementById('fileInput');
const statusArea = document.getElementById('status');
const filesList = document.getElementById('filesList');
const uploadProgress = document.getElementById('uploadProgress');
const progressList = document.getElementById('progressList');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// 用户码相关DOM
const machineIdInput = document.getElementById('machineIdInput');
const generateMachineIdBtn = document.getElementById('generateMachineId');
const copyMachineIdBtn = document.getElementById('copyMachineId');
const queryPointBtn = document.getElementById('queryPoint');
const pointDisplay = document.getElementById('pointDisplay');

// 事件监听器
testConnectionBtn.addEventListener('click', testConnection);
uploadFilesBtn.addEventListener('click', () => fileInput.click());
refreshFilesBtn.addEventListener('click', loadFiles);
fileInput.addEventListener('change', handleFileUpload);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// 生成随机用户码
function randomString(len) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
}

// 生成随机用户码并填入输入框
generateMachineIdBtn.addEventListener('click', async () => {
    machineIdInput.value = '生成中...';
    generateMachineIdBtn.disabled = true;
    try {
        const res = await apiFetch('/api/create_machine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // 不传machine_id，让后端/云端生成
        });
        const data = await res.json();
        // 假设返回的 machine_id 字段为 data.machine_id
        if (data.machine_id) {
            machineIdInput.value = data.machine_id;
            showStatus('用户码生成成功', 'success');
        } else {
            machineIdInput.value = '';
            showStatus(data.message || '生成失败', 'error');
        }
    } catch (e) {
        machineIdInput.value = '';
        showStatus('网络错误: ' + e.message, 'error');
    }
    generateMachineIdBtn.disabled = false;
});

// 复制用户码
copyMachineIdBtn.addEventListener('click', () => {
    if (!machineIdInput.value) return;
    machineIdInput.select();
    document.execCommand('copy');
    showStatus('已复制到剪贴板', 'success');
});

// 查询积分
queryPointBtn.addEventListener('click', async () => {
    const machine_id = machineIdInput.value.trim();
    if (!machine_id) return showStatus('请输入用户码', 'error');
    try {
        const res = await apiFetch('/api/query_point', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ machine_id })
        });
        const data = await res.json();
        if (data.success !== false && data.point !== undefined) {
            pointDisplay.textContent = `当前积分：${data.point}`;
            showStatus('查询成功', 'success');
        } else {
            pointDisplay.textContent = '当前积分：--';
            showStatus(data.message || '查询失败', 'error');
        }
    } catch (e) {
        pointDisplay.textContent = '当前积分：--';
        showStatus('网络错误: ' + e.message, 'error');
    }
});

// 页面加载时初始化积分显示
document.addEventListener('DOMContentLoaded', () => {
    pointDisplay.textContent = '当前积分：--';
});

// 页面加载时获取文件列表
document.addEventListener('DOMContentLoaded', () => {
    loadVideoFiles();
});

// 测试连接
async function testConnection() {
    setButtonLoading(testConnectionBtn, true);
    showStatus('正在测试连接...', 'info');
    
    try {
        const response = await apiFetch('/api/cos?action=test-connection');
        const data = await response.json();
        
        if (data.success) {
            showStatus(data.message, 'success');
            showModal('连接成功', `
                <div style="color: #28a745;">
                    <i class="fas fa-check-circle"></i> ${data.message}
                </div>
                ${data.files.length > 0 ? 
                    `<p style="margin-top: 10px;">示例文件: ${data.files[0].Key}</p>` : 
                    '<p style="margin-top: 10px;">存储桶目前为空</p>'
                }
            `);
        } else {
            showStatus(data.message, 'error');
            showModal('连接失败', `
                <div style="color: #dc3545;">
                    <i class="fas fa-exclamation-circle"></i> ${data.message}
                </div>
            `);
        }
    } catch (error) {
        showStatus('网络错误: ' + error.message, 'error');
        showModal('连接失败', `
            <div style="color: #dc3545;">
                <i class="fas fa-exclamation-circle"></i> 网络错误: ${error.message}
            </div>
        `);
    } finally {
        setButtonLoading(testConnectionBtn, false);
    }
}

// 处理文件上传
async function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    
    setButtonLoading(uploadFilesBtn, true);
    showStatus(`准备上传 ${files.length} 个文件...`, 'info');
    
    // 显示上传进度区域
    uploadProgress.style.display = 'block';
    progressList.innerHTML = '';
    
    // 为每个文件创建进度条
    for (let file of files) {
        const progressItem = createProgressItem(file.name);
        progressList.appendChild(progressItem);
    }
    
    const results = [];
    
    try {
        console.log('🚀 开始上传文件...', files.length, '个文件');
        
        // 逐个上传文件
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`📤 上传文件 ${i + 1}/${files.length}:`, file.name);
            
            try {
                // 1. 获取上传URL
                const urlResponse = await apiFetch('/api/cos?action=get-upload-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type
                    })
                });
                
                console.log('📡 获取上传URL响应:', urlResponse.status);
                
                if (!urlResponse.ok) {
                    const errorText = await urlResponse.text();
                    console.error('❌ 获取上传URL失败:', errorText);
                    throw new Error(`获取上传URL失败: ${errorText}`);
                }
                
                const urlData = await urlResponse.json();
                console.log('✅ 获取上传URL成功:', urlData);
                
                if (!urlData.success) {
                    throw new Error(urlData.message || '获取上传URL失败');
                }
                
                // 2. 直接上传到腾讯云
                console.log('📤 开始上传到腾讯云...');
                const uploadResponse = await fetch(urlData.uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream'
                    }
                });
                
                console.log('📡 腾讯云上传响应:', uploadResponse.status);
                
                if (!uploadResponse.ok) {
                    const errorText = await uploadResponse.text();
                    console.error('❌ 腾讯云上传失败:', errorText);
                    throw new Error(`腾讯云上传失败: ${uploadResponse.status} ${errorText}`);
                }
                
                // 更新进度条
                updateProgressItem(i, 100);
                
                results.push({
                    originalName: file.name,
                    success: true,
                    key: urlData.key,
                    url: `https://${urlData.bucket}.cos.${urlData.region}.myqcloud.com/${urlData.key}`
                });
                
                console.log('✅ 文件上传成功:', file.name);
                
            } catch (fileError) {
                console.error('❌ 文件上传失败:', file.name, fileError);
                updateProgressItem(i, 0, fileError.message);
                
                results.push({
                    originalName: file.name,
                    success: false,
                    error: fileError.message
                });
            }
        }
        
        // 显示上传结果
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        
        if (successCount > 0) {
            showStatus(`成功上传 ${successCount} 个文件${failCount > 0 ? `，${failCount} 个失败` : ''}`, 'success');
            showModal('上传完成', `
                <div style="color: #28a745;">
                    <i class="fas fa-check-circle"></i> 上传完成
                </div>
                <div style="margin-top: 15px;">
                    <strong>上传结果:</strong>
                    <ul style="margin-top: 5px;">
                        ${results.map(result => 
                            `<li style="color: ${result.success ? '#28a745' : '#dc3545'}">
                                ${result.originalName} - ${result.success ? '成功' : '失败: ' + result.error}
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            `);
            
            // 刷新文件列表
            setTimeout(loadFiles, 1000);
        } else {
            showStatus('所有文件上传失败', 'error');
            showModal('上传失败', `
                <div style="color: #dc3545;">
                    <i class="fas fa-exclamation-circle"></i> 所有文件上传失败
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    详细错误信息已输出到控制台
                </div>
            `);
        }
        
    } catch (error) {
        console.error('❌ 上传过程中发生错误:', error);
        console.error('❌ 错误堆栈:', error.stack);
        
        showStatus('上传失败: ' + error.message, 'error');
        showModal('上传失败', `
            <div style="color: #dc3545;">
                <i class="fas fa-exclamation-circle"></i> 上传失败: ${error.message}
            </div>
            <div style="margin-top: 10px; font-size: 12px; color: #666;">
                详细错误信息已输出到控制台
            </div>
        `);
    } finally {
        setButtonLoading(uploadFilesBtn, false);
        fileInput.value = ''; // 清空文件选择
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 5000);
    }
}

// 加载文件列表（兼容旧版本）
async function loadFiles() {
    // 如果存在 filesList 元素，使用旧版本逻辑
    if (filesList) {
        setButtonLoading(refreshFilesBtn, true);
        filesList.innerHTML = '<div class="loading">加载中...</div>';
        
        try {
            const response = await apiFetch('/api/cos?action=files');
            const data = await response.json();
            
            if (data.success) {
                displayFiles(data.files);
            } else {
                filesList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>加载文件列表失败: ${data.message}</p>
                    </div>
                `;
            }
        } catch (error) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>网络错误: ${error.message}</p>
                </div>
            `;
        } finally {
            setButtonLoading(refreshFilesBtn, false);
        }
    } else {
        // 否则调用新版本的函数
        loadVideoFiles();
    }
}

// 显示文件列表
function displayFiles(files) {
    if (files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>暂无文件</p>
            </div>
        `;
        return;
    }
    
    filesList.innerHTML = files.map(file => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-name">${file.displayName || getFileName(file.key)}</div>
                <div class="file-meta">
                    ${formatFileSize(file.size)} • ${formatDate(file.lastModified)}
                </div>
            </div>
            <div class="file-actions">
                <button class="file-btn download-btn" onclick="downloadFile('${file.key}')">
                    <i class="fas fa-download"></i> 下载
                </button>
            </div>
        </div>
    `).join('');
}

// 下载文件
async function downloadFile(objectKey) {
    try {
        const response = await apiFetch('/api/cos?action=download-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ objectKey })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 创建下载链接
            const link = document.createElement('a');
            link.href = data.url;
            // 使用解码后的文件名作为下载文件名
            const fileName = getFileName(objectKey);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showStatus('下载链接已生成', 'success');
        } else {
            showStatus('生成下载链接失败: ' + data.message, 'error');
        }
    } catch (error) {
        showStatus('下载失败: ' + error.message, 'error');
    }
}

// 工具函数
function showStatus(message, type) {
    statusArea.textContent = message;
    statusArea.className = `status-area status-${type}`;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        statusArea.style.opacity = '0';
        setTimeout(() => {
            statusArea.style.opacity = '1';
            statusArea.textContent = '';
            statusArea.className = 'status-area';
        }, 300);
    }, 3000);
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
    } else {
        button.disabled = false;
        if (button === testConnectionBtn) {
            button.innerHTML = '<i class="fas fa-plug"></i> 测试连接';
        } else if (button === uploadFilesBtn) {
            button.innerHTML = '<i class="fas fa-upload"></i> 上传文件';
        } else if (button === refreshFilesBtn) {
            button.innerHTML = '<i class="fas fa-refresh"></i> 刷新文件列表';
        }
    }
}

function showModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
}

function createProgressItem(fileName) {
    const div = document.createElement('div');
    div.className = 'progress-item';
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${fileName}</span>
            <span class="progress-text">0%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
    `;
    return div;
}

function updateAllProgress(percentage) {
    const progressItems = progressList.querySelectorAll('.progress-item');
    progressItems.forEach(item => {
        const progressFill = item.querySelector('.progress-fill');
        const progressText = item.querySelector('.progress-text');
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    });
}

function updateProgressItem(index, percentage, errorMessage = null) {
    const progressItems = progressList.querySelectorAll('.progress-item');
    if (progressItems[index]) {
        const progressFill = progressItems[index].querySelector('.progress-fill');
        const progressText = progressItems[index].querySelector('.progress-text');
        
        if (errorMessage) {
            progressFill.style.width = '0%';
            progressFill.style.backgroundColor = '#dc3545';
            progressText.textContent = '失败';
            progressText.style.color = '#dc3545';
        } else {
            progressFill.style.width = percentage + '%';
            progressFill.style.backgroundColor = percentage === 100 ? '#28a745' : '#007bff';
            progressText.textContent = percentage + '%';
            progressText.style.color = percentage === 100 ? '#28a745' : '#007bff';
        }
    }
}

function getFileName(key) {
    const fileName = key.split('/').pop() || key;
    // 尝试解码文件名
    try {
        return decodeURIComponent(fileName);
    } catch (e) {
        // 如果解码失败，返回原始文件名
        return fileName;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}

// fetch包装，自动加/api/前缀
function apiFetch(url, options) {
    if (!url.startsWith('/api/')) {
        if (url.startsWith('/')) url = '/api' + url;
        else url = '/api/' + url;
    }
    return fetch(url, options);
}

// Zhaoli 相关功能
let videoFiles = [];

// 获取文件列表并渲染
async function loadVideoFiles() {
    const response = await apiFetch('/api/cos?action=files');
    const data = await response.json();
    if (data.success) {
        videoFiles = data.files.map((file, idx) => ({
            ...file,
            index: idx + 1,
            selected: false,
            taskId: '',
            status: '待上传到zhaoli',
            zhaoliFullpath: '',
            zhaoliDownloadUrl: ''
        }));
        renderVideoList();
    }
}

function truncateFileName(name) {
    if (name.length > 20) return name.slice(0, 20) + '...';
    return name;
}

function getFileType(name) {
    const ext = name.split('.').pop().toUpperCase();
    return ext.length <= 5 ? ext : '-';
}

function renderVideoList() {
    const tbody = document.getElementById('videoList');
    if (!tbody) return; // 如果元素不存在，直接返回
    
    tbody.innerHTML = videoFiles.map((file, i) => `
        <tr class="${file.selected ? 'selected' : ''}">
            <td><input type="checkbox" ${file.selected ? 'checked' : ''} onchange="toggleSelect(${i})"></td>
            <td>${file.index}</td>
            <td title="${file.key}">${truncateFileName(file.key)}</td>
            <td>${getFileType(file.key)}</td>
            <td>${formatFileSize(file.size)}</td>
            <td>${file.taskId || '-'}</td>
            <td><span class="status-tag">${file.status}</span></td>
            <td class="cloud-url"><a href="${file.url}" target="_blank">腾讯云链接</a></td>
            <td class="upload-time">${file.lastModified ? formatDate(file.lastModified) : '-'}</td>
        </tr>
    `).join('');
    updateBatchButtons();
}

function updateBatchButtons() {
    const hasSelected = videoFiles.some(f => f.selected);
    const batchProcessBtn = document.getElementById('batchProcessZhaoli');
    const batchDownloadBtn = document.getElementById('batchDownloadZhaoli');
    
    if (batchProcessBtn) batchProcessBtn.disabled = !hasSelected;
    if (batchDownloadBtn) batchDownloadBtn.disabled = !hasSelected;
}

// 全局函数，供 HTML 调用
window.toggleSelect = function(idx) {
    videoFiles[idx].selected = !videoFiles[idx].selected;
    renderVideoList();
}

window.processZhaoliSingle = async function(idx) {
    const file = videoFiles[idx];
    // 直接用腾讯云url作为fullpath
    const fullpath = file.url;
    file.status = 'zhaoli处理中...';
    renderVideoList();
    const res = await apiFetch('/api/process_zhaoli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullpath })
    });
    const data = await res.json();
    if (data.success) {
        file.taskId = data.taskId;
        file.status = 'zhaoli处理已提交';
    } else {
        file.status = 'zhaoli处理失败';
    }
    renderVideoList();
}

window.downloadZhaoliSingle = async function(idx) {
    const file = videoFiles[idx];
    if (!file.taskId) {
        file.status = '请先处理';
        renderVideoList();
        return;
    }
    // 查询状态获取videoUrl
    const res = await apiFetch('/api/status_zhaoli', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: [file.taskId] })
    });
    const data = await res.json();
    const info = data[file.taskId];
    if (info && info.downloadUrl) {
        file.zhaoliDownloadUrl = info.downloadUrl;
        file.status = '可下载';
        // 直接下载
        const a = document.createElement('a');
        a.href = file.zhaoliDownloadUrl;
        a.download = file.key;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        file.status = '未获取到下载链接';
    }
    renderVideoList();
}

// 批量操作事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const batchProcessZhaoli = document.getElementById('batchProcessZhaoli');
    const batchDownloadZhaoli = document.getElementById('batchDownloadZhaoli');

    if (selectAllBtn) {
        selectAllBtn.onclick = function() {
            videoFiles.forEach(f => f.selected = true);
            renderVideoList();
        };
    }
    
    if (deselectAllBtn) {
        deselectAllBtn.onclick = function() {
            videoFiles.forEach(f => f.selected = false);
            renderVideoList();
        };
    }
    
    if (selectAllCheckbox) {
        selectAllCheckbox.onchange = function(e) {
            videoFiles.forEach(f => f.selected = e.target.checked);
            renderVideoList();
        };
    }

    if (batchProcessZhaoli) {
        batchProcessZhaoli.onclick = async function() {
            for (let i = 0; i < videoFiles.length; ++i) {
                if (videoFiles[i].selected) await processZhaoliSingle(i);
            }
        };
    }
    
    if (batchDownloadZhaoli) {
        batchDownloadZhaoli.onclick = async function() {
            for (let i = 0; i < videoFiles.length; ++i) {
                if (videoFiles[i].selected) await downloadZhaoliSingle(i);
            }
        };
    }
}); 
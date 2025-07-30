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
    loadFiles();
});

// 测试连接
async function testConnection() {
    setButtonLoading(testConnectionBtn, true);
    showStatus('正在测试连接...', 'info');
    
    try {
        const response = await apiFetch('/api/test-connection');
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
    
    const formData = new FormData();
    for (let file of files) {
        formData.append('files', file);
        
        // 创建进度条
        const progressItem = createProgressItem(file.name);
        progressList.appendChild(progressItem);
    }
    
    try {
        const response = await apiFetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatus(data.message, 'success');
            showModal('上传成功', `
                <div style="color: #28a745;">
                    <i class="fas fa-check-circle"></i> ${data.message}
                </div>
                <div style="margin-top: 15px;">
                    <strong>上传的文件:</strong>
                    <ul style="margin-top: 5px;">
                        ${data.files.map(file => `<li>${file.originalName}</li>`).join('')}
                    </ul>
                </div>
            `);
            
            // 更新进度条为完成状态
            updateAllProgress(100);
            
            // 刷新文件列表
            setTimeout(loadFiles, 1000);
        } else {
            showStatus(data.message, 'error');
            showModal('上传失败', `
                <div style="color: #dc3545;">
                    <i class="fas fa-exclamation-circle"></i> ${data.message}
                </div>
            `);
        }
    } catch (error) {
        showStatus('上传失败: ' + error.message, 'error');
        showModal('上传失败', `
            <div style="color: #dc3545;">
                <i class="fas fa-exclamation-circle"></i> 上传失败: ${error.message}
            </div>
        `);
    } finally {
        setButtonLoading(uploadFilesBtn, false);
        fileInput.value = ''; // 清空文件选择
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 3000);
    }
}

// 加载文件列表
async function loadFiles() {
    setButtonLoading(refreshFilesBtn, true);
    filesList.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const response = await apiFetch('/api/files');
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
        const response = await apiFetch('/api/download-url', {
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

let videoFiles = [];

// 获取文件列表并渲染
async function loadFiles() {
    const response = await apiFetch('/api/files');
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
    document.getElementById('batchProcessZhaoli').disabled = !hasSelected;
    document.getElementById('batchDownloadZhaoli').disabled = !hasSelected;
}

window.toggleSelect = function(idx) {
    videoFiles[idx].selected = !videoFiles[idx].selected;
    renderVideoList();
}

document.getElementById('selectAllBtn').onclick = function() {
    videoFiles.forEach(f => f.selected = true);
    renderVideoList();
};
document.getElementById('deselectAllBtn').onclick = function() {
    videoFiles.forEach(f => f.selected = false);
    renderVideoList();
};
document.getElementById('selectAllCheckbox').onchange = function(e) {
    videoFiles.forEach(f => f.selected = e.target.checked);
    renderVideoList();
};

document.getElementById('batchProcessZhaoli').onclick = async function() {
    for (let i = 0; i < videoFiles.length; ++i) {
        if (videoFiles[i].selected) await processZhaoliSingle(i);
    }
};
document.getElementById('batchDownloadZhaoli').onclick = async function() {
    for (let i = 0; i < videoFiles.length; ++i) {
        if (videoFiles[i].selected) await downloadZhaoliSingle(i);
    }
};

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

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

// 页面加载时自动加载文件列表
window.addEventListener('DOMContentLoaded', loadFiles); 
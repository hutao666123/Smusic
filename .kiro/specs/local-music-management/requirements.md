# 需求文档

## 简介

本功能为音乐播放器添加本地音乐管理能力，包括歌曲喜欢、自定义歌单管理、在线歌单收藏以及歌曲下载功能。所有数据存储在 Electron 本地文件系统中，确保用户数据的持久化和隐私性。

## 术语表

- **System**: 音乐播放器应用程序
- **User**: 使用音乐播放器的用户
- **Local Playlist**: 存储在本地文件系统的歌单
- **System Playlist**: 系统预定义的歌单（我喜欢的音乐、已下载），不可删除
- **Custom Playlist**: 用户自定义创建的歌单，可增删改
- **Online Playlist**: 从音乐 API 获取的在线歌单
- **Collected Playlist**: 用户收藏的在线歌单引用
- **Song Metadata**: 歌曲的元数据信息（ID、名称、歌手、专辑等）
- **Local Storage**: Electron 应用的用户数据目录（userData）
- **Download Task**: 歌曲下载任务

## 需求

### 需求 1：我喜欢的音乐

**用户故事：** 作为用户，我想要标记喜欢的歌曲，以便快速访问我喜爱的音乐。

#### 验收标准

1. WHEN 用户点击歌曲的喜欢按钮 THEN THE System SHALL 将该歌曲添加到"我喜欢的音乐"歌单
2. WHEN 用户再次点击已喜欢歌曲的喜欢按钮 THEN THE System SHALL 从"我喜欢的音乐"歌单中移除该歌曲
3. WHEN 用户查看"我喜欢的音乐"歌单 THEN THE System SHALL 显示所有已喜欢的歌曲列表
4. WHEN 歌曲被添加到"我喜欢的音乐" THEN THE System SHALL 立即将数据持久化到本地文件
5. WHEN 应用启动时 THEN THE System SHALL 从本地文件加载"我喜欢的音乐"歌单数据

### 需求 2：自定义歌单管理

**用户故事：** 作为用户，我想要创建和管理自己的歌单，以便按照个人喜好组织音乐。

#### 验收标准

1. WHEN 用户创建新歌单 THEN THE System SHALL 生成唯一的歌单 ID 并保存到本地文件
2. WHEN 用户编辑歌单信息 THEN THE System SHALL 更新歌单的名称和描述
3. WHEN 用户删除自定义歌单 THEN THE System SHALL 从本地文件中移除该歌单数据
4. WHEN 用户尝试删除系统歌单 THEN THE System SHALL 拒绝操作并保持系统歌单不变
5. WHEN 用户查看歌单列表 THEN THE System SHALL 显示系统歌单和所有自定义歌单

### 需求 3：歌曲添加到歌单

**用户故事：** 作为用户，我想要将歌曲添加到指定歌单，以便构建个性化的音乐集合。

#### 验收标准

1. WHEN 用户将歌曲添加到歌单 THEN THE System SHALL 保存歌曲的完整元数据到该歌单
2. WHEN 用户添加已存在于歌单中的歌曲 THEN THE System SHALL 检测重复并跳过添加
3. WHEN 用户从歌单中移除歌曲 THEN THE System SHALL 从该歌单数据中删除该歌曲记录
4. WHEN 歌曲被添加到歌单 THEN THE System SHALL 记录添加时间戳
5. WHEN 用户批量添加多首歌曲 THEN THE System SHALL 依次处理每首歌曲并去重

### 需求 4：在线歌单收藏

**用户故事：** 作为用户，我想要收藏在线歌单，以便快速访问喜欢的在线音乐集合。

#### 验收标准

1. WHEN 用户收藏在线歌单 THEN THE System SHALL 保存歌单的 ID 和基本信息到本地文件
2. WHEN 用户取消收藏在线歌单 THEN THE System SHALL 从本地文件中移除该歌单引用
3. WHEN 用户查看收藏的歌单列表 THEN THE System SHALL 显示所有已收藏的在线歌单
4. WHEN 用户播放收藏的在线歌单 THEN THE System SHALL 通过 API 获取最新的歌曲列表
5. WHEN 用户将在线歌单的歌曲添加到自定义歌单 THEN THE System SHALL 复制歌曲元数据到目标歌单

### 需求 5：歌单合并功能

**用户故事：** 作为用户，我想要将整个歌单的歌曲添加到另一个歌单，以便快速组合音乐集合。

#### 验收标准

1. WHEN 用户将歌单 A 的歌曲添加到歌单 B THEN THE System SHALL 复制歌单 A 的所有歌曲到歌单 B
2. WHEN 合并歌单时存在重复歌曲 THEN THE System SHALL 自动去重并保留原有歌曲
3. WHEN 合并在线歌单到本地歌单 THEN THE System SHALL 先通过 API 获取在线歌单的歌曲列表
4. WHEN 合并操作完成 THEN THE System SHALL 显示新增歌曲数量和跳过的重复歌曲数量
5. WHEN 合并大量歌曲时 THEN THE System SHALL 批量处理并更新进度

### 需求 6：歌曲下载功能

**用户故事：** 作为用户，我想要下载歌曲到本地，以便离线播放和节省流量。

#### 验收标准

1. WHEN 用户下载歌曲 THEN THE System SHALL 通过 API 获取歌曲的播放链接
2. WHEN 下载开始 THEN THE System SHALL 将音频文件保存到本地下载目录
3. WHEN 歌曲下载完成 THEN THE System SHALL 将该歌曲添加到"已下载"歌单
4. WHEN 下载过程中 THEN THE System SHALL 实时更新下载进度
5. WHEN 下载失败 THEN THE System SHALL 记录错误信息并允许用户重试
6. WHEN 用户取消下载 THEN THE System SHALL 停止下载任务并删除未完成的文件
7. WHEN 歌曲已存在于本地 THEN THE System SHALL 跳过下载并提示用户

### 需求 7：歌单批量下载

**用户故事：** 作为用户，我想要下载整个歌单的所有歌曲，以便批量获取音乐内容。

#### 验收标准

1. WHEN 用户下载歌单 THEN THE System SHALL 获取歌单的所有歌曲列表
2. WHEN 批量下载开始 THEN THE System SHALL 依次下载每首歌曲
3. WHEN 批量下载进行中 THEN THE System SHALL 显示总体进度（已完成/总数）
4. WHEN 批量下载中某首歌曲失败 THEN THE System SHALL 继续下载其他歌曲并记录失败项
5. WHEN 批量下载完成 THEN THE System SHALL 显示成功和失败的歌曲数量
6. WHEN 用户暂停批量下载 THEN THE System SHALL 停止当前下载并保留已完成的文件

### 需求 8：已下载歌单

**用户故事：** 作为用户，我想要查看所有已下载的歌曲，以便管理本地音乐文件。

#### 验收标准

1. WHEN 歌曲下载完成 THEN THE System SHALL 自动将歌曲添加到"已下载"歌单
2. WHEN 用户查看"已下载"歌单 THEN THE System SHALL 显示所有已下载歌曲及其本地文件信息
3. WHEN 用户播放"已下载"歌单中的歌曲 THEN THE System SHALL 使用本地文件播放
4. WHEN 用户从"已下载"歌单删除歌曲 THEN THE System SHALL 同时删除本地音频文件
5. WHEN 用户查看"已下载"歌单 THEN THE System SHALL 显示总占用磁盘空间

### 需求 9：本地数据持久化

**用户故事：** 作为用户，我希望我的歌单和收藏数据能够持久保存，以便下次启动应用时恢复。

#### 验收标准

1. WHEN 用户进行任何歌单操作 THEN THE System SHALL 立即将更改写入本地 JSON 文件
2. WHEN 应用启动时 THEN THE System SHALL 从本地文件加载所有歌单数据
3. WHEN 本地文件不存在 THEN THE System SHALL 创建默认的数据文件结构
4. WHEN 本地文件损坏 THEN THE System SHALL 记录错误并使用空数据初始化
5. WHEN 数据文件版本不匹配 THEN THE System SHALL 执行数据迁移或提示用户

### 需求 10：Electron IPC 通信

**用户故事：** 作为开发者，我需要安全的主进程与渲染进程通信机制，以便实现文件操作功能。

#### 验收标准

1. WHEN 渲染进程请求文件操作 THEN THE System SHALL 通过 IPC 调用主进程处理
2. WHEN 主进程完成文件操作 THEN THE System SHALL 返回操作结果给渲染进程
3. WHEN IPC 通信发生错误 THEN THE System SHALL 捕获异常并返回错误信息
4. WHEN 暴露 API 到渲染进程 THEN THE System SHALL 使用 contextBridge 确保安全性
5. WHEN 文件路径被传递 THEN THE System SHALL 验证路径的合法性防止路径遍历攻击

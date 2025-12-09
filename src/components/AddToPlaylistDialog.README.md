# AddToPlaylistDialog 组件使用说明

## 概述

AddToPlaylistDialog 是一个用于将歌曲添加到歌单的对话框组件。它支持：
- 显示所有可用的本地歌单（系统歌单 + 自定义歌单）
- 搜索歌单
- 快速创建新歌单
- 单曲或批量添加歌曲到歌单
- 添加结果提示

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| visible | Boolean | false | 控制对话框显示/隐藏 |
| song | Object | null | 要添加的单首歌曲对象 |
| songs | Array | [] | 要批量添加的歌曲数组 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:visible | Boolean | 对话框显示状态变化时触发 |
| success | { playlistId, songsCount } | 添加成功时触发 |
| cancel | - | 取消添加时触发 |

## 歌曲对象格式

```javascript
{
  id: string,           // 歌曲 ID
  name: string,         // 歌曲名称
  artists: Array,       // 艺术家列表
  album: Object,        // 专辑信息
  duration: number,     // 时长（毫秒）
  // ... 其他字段
}
```

## 使用示例

### 1. 基本使用（单曲添加）

```vue
<template>
  <div>
    <button @click="showDialog = true">添加到歌单</button>
    
    <AddToPlaylistDialog
      v-model:visible="showDialog"
      :song="currentSong"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog.vue'

const showDialog = ref(false)
const currentSong = ref({
  id: '123456',
  name: '示例歌曲',
  artists: [{ id: '1', name: '歌手' }],
  album: { id: '1', name: '专辑', picUrl: '...' },
  duration: 240000
})

const handleSuccess = (result) => {
  console.log('添加成功:', result)
  // result: { playlistId: 'xxx', songsCount: 1 }
}

const handleCancel = () => {
  console.log('取消添加')
}
</script>
```

### 2. 批量添加

```vue
<template>
  <div>
    <button @click="addAllToPlaylist">添加全部到歌单</button>
    
    <AddToPlaylistDialog
      v-model:visible="showDialog"
      :songs="selectedSongs"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog.vue'

const showDialog = ref(false)
const selectedSongs = ref([
  { id: '1', name: '歌曲1', /* ... */ },
  { id: '2', name: '歌曲2', /* ... */ },
  { id: '3', name: '歌曲3', /* ... */ }
])

const addAllToPlaylist = () => {
  showDialog.value = true
}

const handleSuccess = (result) => {
  console.log(`成功添加 ${result.songsCount} 首歌曲`)
}
</script>
```

### 3. 在歌曲列表中使用

```vue
<template>
  <div class="song-list">
    <div
      v-for="song in songs"
      :key="song.id"
      class="song-item"
    >
      <span>{{ song.name }}</span>
      <button @click="openAddDialog(song)">
        添加到歌单
      </button>
    </div>
    
    <AddToPlaylistDialog
      v-model:visible="dialogVisible"
      :song="selectedSong"
      @success="onAddSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog.vue'

const songs = ref([/* 歌曲列表 */])
const dialogVisible = ref(false)
const selectedSong = ref(null)

const openAddDialog = (song) => {
  selectedSong.value = song
  dialogVisible.value = true
}

const onAddSuccess = () => {
  // 显示成功提示
  alert('添加成功')
}
</script>
```

## 功能特性

### 1. 搜索歌单
用户可以在搜索框中输入关键词，实时过滤歌单列表。

### 2. 快速创建歌单
点击"新建歌单"按钮，展开创建表单：
- 输入歌单名称（必填）
- 输入歌单描述（可选）
- 创建成功后自动选中新歌单

### 3. 选择歌单
点击歌单项即可选中，选中的歌单会高亮显示并显示勾选图标。

### 4. 添加确认
点击"确定"按钮后：
- 单曲添加：直接添加到选中的歌单
- 批量添加：依次添加所有歌曲，自动去重
- 显示添加结果（成功数量、跳过数量）

### 5. 结果提示
- 成功：绿色提示框，显示"添加成功"或详细统计
- 失败：红色提示框，显示错误信息
- 提示会在 3 秒后自动消失

## 样式定制

组件使用 scoped 样式，如需定制，可以通过以下方式：

1. 覆盖 CSS 变量（如果组件支持）
2. 使用深度选择器修改样式
3. 复制组件并修改样式

## 注意事项

1. 组件依赖 `usePlaylistStore`，确保已正确配置 Pinia
2. 需要在主进程中实现相应的 IPC 接口
3. 歌曲对象必须包含必要的字段（id, name, artists, album, duration）
4. 批量添加时会自动去重，重复的歌曲会被跳过

## 依赖

- Vue 3 Composition API
- Pinia (usePlaylistStore)
- Electron IPC (window.electron)

## 相关文件

- 组件：`src/components/AddToPlaylistDialog.vue`
- Store：`src/stores/playlist.js`
- 主进程：`electron-main.js`
- Preload：`preload.js`

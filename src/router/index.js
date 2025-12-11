import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Search from '../pages/Search.vue'
import Playlist from '../pages/Playlist.vue'
import Discover from '../pages/Discover.vue'
import SongDetail from '../pages/SongDetail.vue'
import Lyrics from '../pages/Lyrics.vue'
import Player from '../pages/Player.vue'
import TopPlaylists from '../pages/TopPlaylists.vue'
import NewAlbums from '../pages/NewAlbums.vue'
import Album from '../pages/Album.vue'
import MyPlaylists from '../pages/MyPlaylists.vue'
import CollectedPlaylists from '../pages/CollectedPlaylists.vue'
import LocalPlaylist from '../pages/LocalPlaylist.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/playlist/:id',
    name: 'Playlist',
    component: Playlist
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover
  },
  {
    path: '/song/:id',
    name: 'SongDetail',
    component: SongDetail
  },
  {
    path: '/lyrics',
    name: 'Lyrics',
    component: Lyrics
  },
  {
    path: '/player',
    name: 'Player',
    component: Player
  },
  {
    path: '/playlist/top',
    name: 'TopPlaylists',
    component: TopPlaylists
  },
  {
    path: '/album/new',
    name: 'NewAlbums',
    component: NewAlbums
  },
  {
    path: '/album/:id',
    name: 'Album',
    component: Album
  },
  {
    path: '/my-playlists',
    name: 'MyPlaylists',
    component: MyPlaylists
  },
  {
    path: '/collected-playlists',
    name: 'CollectedPlaylists',
    component: CollectedPlaylists
  },
  {
    path: '/local-playlist/:id',
    name: 'LocalPlaylist',
    component: LocalPlaylist
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 添加路由过渡动画
router.beforeEach((to, from, next) => {
  // 标记过渡类型
  if (to.path === '/lyrics' && from.path !== '/lyrics') {
    document.documentElement.style.setProperty('--route-transition', 'enter')
  } else if (from.path === '/lyrics' && to.path !== '/lyrics') {
    document.documentElement.style.setProperty('--route-transition', 'exit')
  }
  next()
})

export default router

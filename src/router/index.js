import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Search from '../pages/Search.vue'
import Playlist from '../pages/Playlist.vue'
import Debug from '../pages/Debug.vue'
import Login from '../pages/Login.vue'
import Discover from '../pages/Discover.vue'
import Profile from '../pages/Profile.vue'
import SongDetail from '../pages/SongDetail.vue'
import Lyrics from '../pages/Lyrics.vue'

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
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/debug',
    name: 'Debug',
    component: Debug
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
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

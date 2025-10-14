// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'

// createApp(App).mount('#app')
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Impor Pinia

import App from './App.vue';
import router from './router'; // Impor router kita
import './assets/main.css';

const app = createApp(App);

app.use(createPinia()); // Gunakan Pinia
app.use(router); // Gunakan router

app.mount('#app');
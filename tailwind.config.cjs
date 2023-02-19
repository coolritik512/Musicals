/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        "green" :"#1db954",
        "black" : "#191414",
        "primary" : "#FFFFFF",
        "secondary":'#b3b3b3',
        "black-secondary" : '#171818',
        "black-primary" : '#191414',
        "black-base" : "#121212",
        "light-black" :"#282828",
       
      }
    },
    gridTemplateColumns:{
      'auto-fill-card' : 'repeat(auto-fill , minmax(160px,1fr))',
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                board: {
                    wood: '#DEB887',
                    dark: '#8B6914',
                    line: '#1a1a1a',
                },
            },
        },
    },
    plugins: [],
};
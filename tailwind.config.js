// Configuración de Tailwind de la página (la misma que usaba la versión que se descargaba al abrirla).
// Para volver a generar css/tailwind.css después de cambiar clases en index.html o js/:
//   npm i -D tailwindcss@3.4.17 @tailwindcss/forms@0.5.10 @tailwindcss/container-queries@0.1.1
//   npx tailwindcss -c tailwind.config.js -i tailwind.input.css -o css/tailwind.css --minify
const config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "background": "#f8faf1",
                        "on-background": "#191c17",
                        "on-surface": "#191c17",
                        "on-surface-variant": "#49473f",
                        "outline": "#7a776e",
                        "outline-variant": "#cac6bc",
                        "surface": "#f8faf1",
                        "surface-bright": "#f8faf1",
                        "surface-variant": "#e1e3db",
                        "surface-dim": "#d9dbd2",
                        "surface-container": "#edefe6",
                        "surface-container-low": "#f3f4ec",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-high": "#e7e9e0",
                        "surface-container-highest": "#e1e3db",
                        "primary": "#615e57",
                        "primary-container": "#f6f1e7",
                        "secondary": "#5d5f57",
                        "tertiary": "#7b580e",
                        "tertiary-fixed": "#ffdea8",
                        "gold": { "400": "#D8BC7E", "600": "#B99043" }
                    },
                    borderRadius: { "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px" },
                    spacing: {
                        "gutter": "24px",
                        "container-max": "1280px",
                        "section-padding": "120px"
                    },
                    fontFamily: {
                        "body-lg": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"], "body-md": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"], "label-upper": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"],
                        "display-lg": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"], "headline-lg": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"], "headline-md": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"], "headline-sm": ["-apple-system","BlinkMacSystemFont","SF Pro Display","SF Pro Text","Helvetica Neue","Inter","Segoe UI","Roboto","sans-serif"]
                    },
                    fontSize: {
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "label-upper": ["12px", { "lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "600" }],
                        "display-lg": ["64px", { "lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "400" }],
                        "headline-lg": ["48px", { "lineHeight": "56px", "fontWeight": "400" }],
                        "headline-md": ["32px", { "lineHeight": "40px", "fontWeight": "400" }],
                        "headline-sm": ["24px", { "lineHeight": "32px", "fontWeight": "500" }]
                    }
                }
            }
        };
config.content = ['./index.html', './js/**/*.js'];
config.plugins = [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')];
module.exports = config;

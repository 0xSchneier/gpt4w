module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        base: ['Inter'],
      },
      textColor: {
        base: 'var(--color-txt)',
        primary: 'var(--color-txt-primary)',
        secondary: 'var(--color-txt-secondary)',
        danger: 'var(--color-txt-danger)',
        desc: 'var(--color-desc-text)',
        green: 'var(--color-txt-green)',
        blue: 'var(--color-txt-blue)',
        red: 'var(--color-txt-red)',
        'btn-other': 'var(--color-btn-other)',
        other: 'var(--color-txt-other)',
      },
      backgroundColor: {
        base: 'var(--color-bg)',
        box: 'var(--color-bg-box)',
        line: 'var(--color-bg-line)',
        primary: 'var(--color-txt-primary)',
        green: 'var(--color-bg-green)',
        'deep-green': 'var(--color-txt-green)',
        blue: 'var(--color-bg-blue)',
        red: 'var(--color-bg-red)',
        danger: 'var(--color-txt-red)',
      },
      borderColor: {
        base: 'var(--color-txt)',
        green: 'var(--color-border-green)',
        blue: 'var(--color-border-blue)',
        red: 'var(--color-border-red)',
      },
      boxShadow: {
        input: '0px 1px 21px rgba(0, 0, 0, 0.1)',
      },
    },
    fontFamily: false,
  },
  plugins: [require('@tailwindcss/line-clamp')],
}

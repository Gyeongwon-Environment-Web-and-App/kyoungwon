module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		screens: {
  			xxxs: '340px',
  			xxs: '374px',
  			xs: '390px',
  			xsm: '429px',
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1536px',
  			'3xl': '1650px',
  			'4xl': '1790px'
  		},
  		colors: {
  			efefef: '#EFEFEF',
  			under: '#868686',
  			d9d9d9: '#D9D9D9',
  			bababa: '#BABABA',
  			a8a8a8: '#A8A8A8',
  			a2a2a2: '#A2A2A2',
  			a5a5a5: '#A5A5A5',
  			f0f0f0: '#F0F0F0',
  			ebebeb: '#EBEBEB',
  			'8d8d8d': '#8D8D8D',
  			'4e4e4e': '#4E4E4E',
  			'light-border': '#ACACAC',
  			'darker-green': '#3CB64C',
  			'light-green': '#00BA13',
  			'lighter-green': '#C4FFCA',
  			'gray-text': '#757575',
  			red: '#FF0000',
  			'button-selected': '#89FF9580',
  			'dark-gray': '#4A4A4A',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			custom: '0px 0px 9.69px 4.85px rgba(164, 164, 164, 0.25)',
  			'custom-lg': '0px 0px 15px 7px rgba(164, 164, 164, 0.3)'
  		},
  		keyframes: {
  			slideIn: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(0)'
  				}
  			},
  			slideOut: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-100%)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			slideIn: 'slideIn 0.3s ease-in-out forwards',
  			slideOut: 'slideOut 0.3s ease-in-out forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        'button:hover': {
          outline: 'none',
        },
        'button:focus': {
          outline: 'none',
        },
      });
    },
    require('tailwindcss-animate'),
  ],
};

import { styled } from '~/styled-system/jsx'
import { cva } from '~/styled-system/css'

export const typography = cva({
  base: {
    color: "text",
    fontSize: "1rem",
    fontWeight: 400,
  },
  variants: {
    variant: {
      h1: {
        color: "text-header",
        fontFamily: "Lato",
        fontWeight: 900,
        fontSize: "2rem",
      },
      h2: {
        color: "text-header",
        fontFamily: "Lato",
        fontWeight: 700,
        fontSize: "1.5rem",
      },
      h3: {
        color: "text-header",
        fontFamily: "Lato",
        fontWeight: 500,
        fontSize: "1.25rem",
      },
      body: {
        fontSize: "1rem",
      },
      small: {
        color: "text-subtle",
        fontSize: "0.85rem",
      },
      logo: {
        fontFamily: "Nanum Pen Script",
        fontSize: 20,
      }
    },
  }
});

export const Typography = styled('span', typography);

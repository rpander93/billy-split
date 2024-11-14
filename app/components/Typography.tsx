import { styled } from '~/styled-system/jsx'
import { cva } from '~/styled-system/css'

export const typography = cva({
  base: {
    color: "text",
    fontFamily: "PT Serif",
    fontSize: "1rem",
    fontWeight: 400,
  },
  variants: {
    variant: {
      h1: {
        color: "text-header",
        fontFamily: "Lato",
        fontWeight: "900",
        fontSize: "2rem",
      },
      h2: {
        color: "text-header",
        fontFamily: "Lato",
        fontWeigth: "700",
        fontSize: "1.5rem",
      },
      body: {
        fontFamily: "PT Serif",
        fontSize: "1rem",
        fontWeight: 400,
      },
      small: {
        color: "text-subtle",
        fontFamily: "PT Serif",
        fontSize: "1rem",
      },
      logo: {
        fontFamily: "Nanum Pen Script",
        fontSize: 20,
      }
    },
  }
});

export const Typography = styled('span', typography);

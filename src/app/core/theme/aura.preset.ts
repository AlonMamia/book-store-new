import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const AuraPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: '{slate.0}',
          50: '{slate.50}',
          100: '{slate.100}',
          300: '{slate.300}',
          400: '{slate.400}',
          900: '{slate.900}',
        },
      },
      dark: {
        surface: {
          0: '{zinc.950}', // ברשת כהה - surface.0 הוא הרקע הכהה ביותר
          50: '{zinc.900}',
          100: '{zinc.800}',
          900: '{zinc.50}', // surface.900 הוא הבהיר ב-Dark Mode
        },
      },
    },
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
    },
    formField: {
      hoverBorderColor: '{primary.color}',
    },
  },
  components: {
    card: {
      root: {
        background: '{surface.0}', // משתמש ב-surface.0 שישתנה אוטומטית לפי ה-Scheme
      },
    },
  },
});

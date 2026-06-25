const tokens = require("./design-tokens.json");

module.exports = {
  theme: {
    extend: {
      colors: {
        kts: {
          primary: tokens.color.primary,
          "primary-hover": tokens.color.primaryHover,
          secondary: tokens.color.secondary,
          background: tokens.color.background,
          surface: tokens.color.surface,
          "surface-muted": tokens.color.surfaceMuted,
          wood: tokens.color.wood,
          border: tokens.color.border,
          text: tokens.color.text,
          muted: tokens.color.textMuted,
          success: tokens.color.success,
          warning: tokens.color.warning,
          danger: tokens.color.danger,
          info: tokens.color.info
        }
      },
      fontFamily: {
        sans: tokens.font.sans.split(", ")
      },
      fontSize: {
        display: tokens.fontSize.display,
        h1: tokens.fontSize.h1,
        h2: tokens.fontSize.h2,
        h3: tokens.fontSize.h3,
        body: tokens.fontSize.body,
        "body-sm": tokens.fontSize.bodySm,
        ui: tokens.fontSize.ui,
        caption: tokens.fontSize.caption
      },
      spacing: {
        1: tokens.spacing["1"],
        2: tokens.spacing["2"],
        4: tokens.spacing["4"],
        6: tokens.spacing["6"],
        8: tokens.spacing["8"],
        10: tokens.spacing["10"],
        12: tokens.spacing["12"],
        16: tokens.spacing["16"]
      },
      borderRadius: {
        sm: tokens.radius.sm,
        md: tokens.radius.md,
        lg: tokens.radius.lg,
        xl: tokens.radius.xl,
        full: tokens.radius.full
      },
      boxShadow: {
        card: tokens.shadow.card,
        hover: tokens.shadow.hover,
        focus: tokens.shadow.focus
      },
      transitionDuration: {
        fast: tokens.motion.fast,
        base: tokens.motion.base,
        slow: tokens.motion.slow
      },
      transitionTimingFunction: {
        kts: tokens.motion.ease
      },
      screens: {
        tablet: tokens.breakpoint.tablet,
        desktop: tokens.breakpoint.desktop,
        ultrawide: tokens.breakpoint.ultrawide
      },
      zIndex: {
        dropdown: String(tokens.zIndex.dropdown),
        sticky: String(tokens.zIndex.sticky),
        fixed: String(tokens.zIndex.fixed),
        modal: String(tokens.zIndex.modal),
        toast: String(tokens.zIndex.toast)
      }
    }
  }
};

import { StyleSheet, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from './Colors';

const isWeb = Platform.OS === 'web';

// Minimum Touch-Target-Größe (Material Design 48dp, Apple HIG 44pt)
export const MIN_TOUCH_TARGET = 48;

export const SHARED = StyleSheet.create({
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: isWeb ? 8 : 10,
    paddingHorizontal: 12,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.primary,
    minHeight: MIN_TOUCH_TARGET,
  },
  textarea: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingVertical: isWeb ? 8 : 10,
    paddingHorizontal: 12,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.primary,
    height: 72,
    textAlignVertical: 'top' as const,
  },
  label: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  // Überschriften
  pageTitle: {
    ...TYPOGRAPHY.styles.h1,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
  },
  cardTitle: {
    ...TYPOGRAPHY.styles.h4,
  },
  bodyText: {
    ...TYPOGRAPHY.styles.body,
  },
  captionText: {
    ...TYPOGRAPHY.styles.caption,
  },
  labelCaps: {
    ...TYPOGRAPHY.styles.label,
  },
  primaryButton: {
    backgroundColor: COLORS.gradientStart,
    borderRadius: RADIUS.sm,
    paddingVertical: isWeb ? 8 : 10,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center' as const,
  },
  primaryButtonText: {
    color: COLORS.white,
    ...TYPOGRAPHY.styles.button,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.gradientStart,
    borderRadius: RADIUS.sm,
    paddingVertical: isWeb ? 8 : 10,
    paddingHorizontal: 16,
    alignItems: 'center' as const,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center' as const,
  },
  secondaryButtonText: {
    color: COLORS.gradientStart,
    ...TYPOGRAPHY.styles.button,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  goldCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    ...SHADOWS.sm,
  },
  fieldSpacing: {
    marginBottom: SPACING.sm,
  },
  sectionSpacing: {
    marginBottom: SPACING.md,
  },
  screenPadding: {
    padding: SPACING.lg,
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type PressableStateCallbackType,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarColors, MaxContentWidth, MinTouch, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { initials } from '@/lib/format';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// Visible keyboard focus ring on web (react-native-web supports focus styles).
const focusRing = (color: string) =>
  Platform.OS === 'web' ? ({ outlineColor: color, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2 } as object) : {};

/** Pressable style callback that also exposes keyboard focus (react-native-web). */
const pressStyle =
  (fn: (s: { pressed: boolean; focused: boolean }) => StyleProp<ViewStyle>) =>
  (state: PressableStateCallbackType) =>
    fn({ pressed: state.pressed, focused: !!(state as { focused?: boolean }).focused });

// ---- Layout -----------------------------------------------------------------

export function Screen({ children, scroll = true, ...rest }: { children: ReactNode; scroll?: boolean } & ScrollViewProps) {
  const theme = useTheme();
  const inner = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" {...rest}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

// ---- Text -------------------------------------------------------------------

type Variant = 'title' | 'heading' | 'body' | 'label' | 'caption';
export function AppText({
  variant = 'body',
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: 'text' | 'textSecondary' | 'primary' | 'danger' | 'success' | 'warning' }) {
  const theme = useTheme();
  return (
    <Text
      // Text scales with the user's accessibility font-size setting.
      style={[textStyles[variant], { color: theme[color ?? (variant === 'caption' ? 'textSecondary' : 'text')] }, style]}
      accessibilityRole={variant === 'title' || variant === 'heading' ? 'header' : undefined}
      {...rest}
    />
  );
}

// ---- Buttons ----------------------------------------------------------------

type ButtonKind = 'primary' | 'secondary' | 'danger' | 'ghost';
export function Button({
  label,
  kind = 'primary',
  icon,
  disabled,
  style,
  accessibilityHint,
  ...rest
}: Omit<PressableProps, 'children' | 'style'> & { label: string; kind?: ButtonKind; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const bg = { primary: theme.primary, secondary: 'transparent', danger: theme.danger, ghost: 'transparent' }[kind];
  const fg = { primary: theme.onPrimary, secondary: theme.primary, danger: theme.onDanger, ghost: theme.primary }[kind];
  const borderColor = kind === 'secondary' ? theme.primary : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={pressStyle(({ pressed, focused }) => [
        styles.button,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        focused && focusRing(theme.primary),
        style,
      ])}
      {...rest}>
      {icon ? <Ionicons name={icon} size={20} color={fg} accessibilityElementsHidden importantForAccessibility="no" /> : null}
      <Text style={[textStyles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

// ---- Cards & rows -----------------------------------------------------------

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return <View style={[styles.card, { backgroundColor: theme.surface }, style]}>{children}</View>;
}

export function Section({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  return (
    <View style={styles.section}>
      {title ? (
        <AppText variant="caption" style={styles.sectionTitle} accessibilityRole="header">
          {title.toUpperCase()}
        </AppText>
      ) : null}
      <Card style={styles.sectionCard}>{children}</Card>
      {footer ? <AppText variant="caption" style={styles.sectionFooter}>{footer}</AppText> : null}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  icon,
  value,
  onPress,
  danger,
  external,
  accessibilityHint,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  external?: boolean;
  accessibilityHint?: string;
}) {
  const theme = useTheme();
  const color = danger ? theme.danger : theme.text;
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={22} color={danger ? theme.danger : theme.primary} importantForAccessibility="no" accessibilityElementsHidden /> : null}
      <View style={styles.flex}>
        <Text style={[textStyles.body, { color }]}>{title}</Text>
        {subtitle ? <Text style={[textStyles.caption, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={[textStyles.caption, { color: theme.textSecondary }]}>{value}</Text> : null}
      {onPress ? (
        <Ionicons
          name={external ? 'open-outline' : 'chevron-forward'}
          size={18}
          color={theme.textSecondary}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
      ) : null}
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.row} accessible accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint ?? (external ? 'Opens in your browser' : undefined)}
      style={pressStyle(({ pressed, focused }) => [
        styles.row,
        pressed && { backgroundColor: theme.surfaceAlt },
        focused && focusRing(theme.primary),
      ])}>
      {content}
    </Pressable>
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.surfaceAlt, marginLeft: Spacing.md }} />;
}

// ---- Form controls ----------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  multiline,
  style,
  ...rest
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[textStyles.label, { color: theme.text }]} nativeID={`${label}-label`}>
        {label}
      </Text>
      {hint ? <Text style={[textStyles.caption, { color: theme.textSecondary }]}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        aria-labelledby={`${label}-label`}
        aria-invalid={!!error}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          { color: theme.text, backgroundColor: theme.background, borderColor: error ? theme.danger : theme.border },
          error ? { borderWidth: 2 } : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[textStyles.caption, { color: theme.danger }]} accessibilityLiveRegion="polite" role="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function Checkbox({ checked, onChange, children, label }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; label: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={pressStyle(({ focused }) => [styles.checkRow, focused && focusRing(theme.primary)])}>
      <View
        style={[
          styles.checkBox,
          { borderColor: checked ? theme.primary : theme.border, backgroundColor: checked ? theme.primary : 'transparent' },
        ]}>
        {checked ? <Ionicons name="checkmark" size={18} color={theme.onPrimary} importantForAccessibility="no" /> : null}
      </View>
      <View style={styles.flex}>{children}</View>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[textStyles.label, { color: theme.text }]}>{label}</Text>
      <View style={[styles.segmented, { borderColor: theme.border }]} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={o.label}
              onPress={() => onChange(o.value)}
              style={pressStyle(({ focused }) => [
                styles.segment,
                { backgroundColor: selected ? theme.primary : 'transparent' },
                focused && focusRing(theme.primary),
              ])}>
              <Text style={[textStyles.label, { color: selected ? theme.onPrimary : theme.text }]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ---- Misc -------------------------------------------------------------------

export function Avatar({ name, colorIndex, size = 44 }: { name: string; colorIndex: number; size?: number }) {
  return (
    <View
      // Decorative: the agent's name is always shown next to it.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: AvatarColors[colorIndex % AvatarColors.length],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: size * 0.38 }} allowFontScaling={false}>
        {initials(name)}
      </Text>
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' }) {
  const theme = useTheme();
  const color = tone === 'success' ? theme.success : tone === 'warning' ? theme.warning : theme.textSecondary;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[textStyles.caption, { color, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: string; action?: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={48} color={theme.textSecondary} importantForAccessibility="no" accessibilityElementsHidden />
      <AppText variant="heading" style={styles.center}>{title}</AppText>
      <AppText color="textSecondary" style={styles.center}>{body}</AppText>
      {action}
    </View>
  );
}

export function Banner({ tone = 'info', children }: { tone?: 'info' | 'warning' | 'danger'; children: ReactNode }) {
  const theme = useTheme();
  const color = tone === 'danger' ? theme.danger : tone === 'warning' ? theme.warning : theme.primary;
  return (
    <View style={[styles.banner, { borderLeftColor: color, backgroundColor: theme.surface }]} accessibilityRole="summary">
      {children}
    </View>
  );
}

// ---- Styles -----------------------------------------------------------------

export const textStyles = StyleSheet.create({
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20 },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  scroll: { flexGrow: 1 },
  content: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.md, gap: Spacing.md },
  button: {
    minHeight: MinTouch,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  card: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  section: { gap: Spacing.xs },
  sectionTitle: { marginLeft: Spacing.sm, fontWeight: '600', letterSpacing: 0.5 },
  sectionCard: { padding: 0, overflow: 'hidden', gap: 0 },
  sectionFooter: { marginHorizontal: Spacing.sm },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  field: { gap: Spacing.xs },
  input: { minHeight: MinTouch, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: 16 },
  inputMultiline: { minHeight: 140, textAlignVertical: 'top' },
  checkRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', minHeight: MinTouch, paddingVertical: Spacing.xs },
  checkBox: { width: 28, height: 28, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  segmented: { flexDirection: 'row', borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  segment: { flex: 1, minHeight: MinTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  badge: { borderWidth: 1, borderRadius: Radius.pill, paddingHorizontal: Spacing.sm, alignSelf: 'flex-start' },
  empty: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl, paddingHorizontal: Spacing.md },
  banner: { borderLeftWidth: 4, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.xs },
});

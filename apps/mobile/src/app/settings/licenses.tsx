import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Card } from '@/components/ui';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LICENSES } from '@/legal/licenses.generated';

export default function Licenses() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <FlatList
        data={LICENSES}
        keyExtractor={(p) => `${p.name}@${p.version}`}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Card style={styles.header}>
            <AppText variant="heading">Thank you, open source</AppText>
            <AppText>
              {`This app is built with ${LICENSES.length} open-source packages, listed below with their licences. Full licence texts are in THIRD_PARTY_NOTICES.md in the source code.`}
            </AppText>
            <AppText variant="caption">
              {"Fonts: the app uses your device's built-in system fonts."} Icons: Ionicons (MIT licence). App icon and images:
              original artwork created for this project.
            </AppText>
          </Card>
        }
        renderItem={({ item }) => (
          <View style={styles.row} accessible accessibilityLabel={`${item.name}, version ${item.version}, ${item.license} licence`}>
            <AppText style={styles.flex}>{item.name}</AppText>
            <AppText variant="caption">{item.license}</AppText>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: Spacing.md, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  header: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.sm, minHeight: 44, alignItems: 'center' },
});

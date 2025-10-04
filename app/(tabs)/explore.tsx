// app/(tabs)/explore.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addItem, deleteItem, getAllItems } from '../database';
import useDatabase from '../hooks/useDatabase';

type Item = {
  id: number;
  name: string;
  created_at?: string;
};

export default function ExploreScreen() {
  const { ready, error } = useDatabase();
  const [items, setItems] = useState<Item[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (ready) {
      load();
    }
  }, [ready]);

  async function load() {
    try {
      const rows = await getAllItems();
      setItems(rows);
    } catch (err) {
      console.error(err);
      Alert.alert('DB error', 'Could not load items');
    }
  }

  async function handleAdd() {
    if (!text.trim()) return;
    try {
      await addItem(text.trim());
      setText('');
      await load();
    } catch (err) {
      console.error(err);
      Alert.alert('DB error', 'Could not add item');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteItem(id);
      await load();
    } catch (err) {
      console.error(err);
      Alert.alert('DB error', 'Could not delete item');
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>DB initialization error: {String(error)}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <Text>Initializing database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQLite demo</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="New item name"
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <Button title="Add" onPress={handleAdd} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => <Text style={styles.empty}>No items yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemDate}>{item.created_at}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                Alert.alert('Delete', `Delete "${item.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
                ])
              }
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginRight: 8 },
  empty: { textAlign: 'center', marginTop: 16, color: '#666' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16 },
  itemDate: { fontSize: 12, color: '#888' },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 6 },
  deleteText: { color: 'red', fontWeight: '600' },
});

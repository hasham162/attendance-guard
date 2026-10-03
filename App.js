import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, SafeAreaView, StatusBar,
} from 'react-native';
import { BarChart, ProgressChart } from 'react-native-chart-kit';

// ---------- constants & helpers ----------
const THRESHOLD = 75; // change this in the viva: attendance % that counts as "safe"
const screenWidth = Dimensions.get('window').width;

const INITIAL_COURSES = [
  { id: 1, name: 'Mobile Development', attended: 18, total: 22 },
  { id: 2, name: 'Database Systems', attended: 12, total: 20 },
  { id: 3, name: 'Operating Systems', attended: 15, total: 18 },
];

const percent = (c) => (c.total === 0 ? 0 : Math.round((c.attended / c.total) * 100));
const isAtRisk = (c) => percent(c) < THRESHOLD;

// How many more classes can be missed (safe) or must be attended in a row (at risk)
const advice = (c) => {
  const t = THRESHOLD / 100;
  if (!isAtRisk(c)) {
    const canMiss = Math.floor(c.attended / t - c.total);
    return `You can miss ${canMiss} more class${canMiss === 1 ? '' : 'es'}`;
  }
  const mustAttend = Math.ceil((t * c.total - c.attended) / (1 - t));
  return `Attend the next ${mustAttend} class${mustAttend === 1 ? '' : 'es'} to recover`;
};

// ---------- reusable components ----------
const Button = ({ label, onPress, variant = 'primary', small }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.btn, styles[`btn_${variant}`], small && styles.btnSmall]}
  >
    <Text style={[styles.btnText, variant !== 'primary' && styles.btnTextDark]}>{label}</Text>
  </TouchableOpacity>
);

const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const CourseCard = ({ course, onPresent, onAbsent, onDelete }) => {
  const pct = percent(course);
  const risk = isAtRisk(course);
  return (
    <View style={[styles.card, risk && styles.cardRisk]}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{course.name}</Text>
        <Text style={[styles.pct, risk ? styles.pctBad : styles.pctGood]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }, risk ? styles.fillBad : styles.fillGood]} />
      </View>
      <Text style={styles.meta}>
        {course.attended} of {course.total} classes attended
      </Text>
      <Text style={[styles.advice, risk && styles.adviceBad]}>{advice(course)}</Text>
      <View style={styles.row}>
        <Button small label="Present" onPress={() => onPresent(course.id)} />
        <Button small variant="secondary" label="Absent" onPress={() => onAbsent(course.id)} />
        <Button small variant="danger" label="Delete" onPress={() => onDelete(course.id)} />
      </View>
    </View>
  );
};

const EmptyState = ({ filtered }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>{filtered ? 'No courses at risk' : 'No courses yet'}</Text>
    <Text style={styles.meta}>
      {filtered
        ? `Every course is at or above ${THRESHOLD}%. Nice work.`
        : 'Add your first course below to start tracking attendance.'}
    </Text>
  </View>
);

const AddCourseForm = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [attended, setAttended] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    const a = parseInt(attended, 10);
    const t = parseInt(total, 10);
    if (name.trim().length < 2) return setError('Enter a course name (at least 2 letters).');
    if (isNaN(a) || isNaN(t)) return setError('Attended and total must be numbers.');
    if (t <= 0) return setError('Total classes must be more than 0.');
    if (a < 0 || a > t) return setError('Attended must be between 0 and total classes.');
    onAdd({ id: Date.now(), name: name.trim(), attended: a, total: t });
    setName(''); setAttended(''); setTotal(''); setError('');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add a course</Text>
      <TextInput
        style={styles.input}
        placeholder="Course name"
        value={name}
        onChangeText={setName}
        maxLength={40}
        returnKeyType="next"
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Attended"
          value={attended}
          onChangeText={setAttended}
          keyboardType="number-pad"
          maxLength={3}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="Total"
          value={total}
          onChangeText={setTotal}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>
      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <Button label="Add course" onPress={submit} />
    </View>
  );
};

// ---------- screens ----------
const CoursesView = ({ courses, setCourses }) => {
  const [filter, setFilter] = useState('all'); // 'all' | 'risk'
  const [sortLow, setSortLow] = useState(false);

  const change = (id, dAttended, dTotal) =>
    setCourses(courses.map((c) =>
      c.id === id ? { ...c, attended: c.attended + dAttended, total: c.total + dTotal } : c
    ));

  let visible = filter === 'risk' ? courses.filter(isAtRisk) : [...courses];
  if (sortLow) visible.sort((a, b) => percent(a) - percent(b));

  const riskCount = courses.filter(isAtRisk).length;

  return (
    <>
      {riskCount > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {riskCount} course{riskCount > 1 ? 's are' : ' is'} below {THRESHOLD}% attendance
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="At risk" active={filter === 'risk'} onPress={() => setFilter('risk')} />
        <Chip label="Lowest first" active={sortLow} onPress={() => setSortLow(!sortLow)} />
      </View>

      {visible.length === 0 ? (
        <EmptyState filtered={filter === 'risk' && courses.length > 0} />
      ) : (
        visible.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            onPresent={(id) => change(id, 1, 1)}
            onAbsent={(id) => change(id, 0, 1)}
            onDelete={(id) => setCourses(courses.filter((x) => x.id !== id))}
          />
        ))
      )}

      <AddCourseForm onAdd={(course) => setCourses([...courses, course])} />
    </>
  );
};

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(31, 78, 95, ${opacity})`,
  labelColor: () => '#4a5560',
  barPercentage: 0.6,
};

const DashboardView = ({ courses }) => {
  if (courses.length === 0) return <EmptyState />;

  const totalAttended = courses.reduce((s, c) => s + c.attended, 0);
  const totalClasses = courses.reduce((s, c) => s + c.total, 0);
  const overall = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);
  const safe = courses.filter((c) => !isAtRisk(c)).length;

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overall attendance</Text>
        <Text style={[styles.big, overall < THRESHOLD ? styles.pctBad : styles.pctGood]}>
          {overall}%
        </Text>
        <Text style={styles.meta}>
          {safe} of {courses.length} courses are at or above {THRESHOLD}%
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Attendance by course</Text>
        <BarChart
          data={{
            labels: courses.map((c) => c.name.split(' ')[0].slice(0, 6)),
            datasets: [{ data: courses.map(percent) }],
          }}
          width={screenWidth - 64}
          height={220}
          yAxisSuffix="%"
          fromZero
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Progress per course</Text>
        <ProgressChart
          data={{
            labels: courses.slice(0, 4).map((c) => c.name.split(' ')[0].slice(0, 6)),
            data: courses.slice(0, 4).map((c) => percent(c) / 100),
          }}
          width={screenWidth - 64}
          height={200}
          strokeWidth={12}
          radius={28}
          chartConfig={chartConfig}
          hideLegend={false}
        />
        {courses.length > 4 && <Text style={styles.meta}>Showing the first 4 courses</Text>}
      </View>
    </>
  );
};

// ---------- app ----------
export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [view, setView] = useState('courses'); // view switching with state, no navigation library

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Attendance Guard</Text>
      <View style={styles.switch}>
        <Chip label="Courses" active={view === 'courses'} onPress={() => setView('courses')} />
        <Chip label="Dashboard" active={view === 'dashboard'} onPress={() => setView('dashboard')} />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {view === 'courses' ? (
          <CoursesView courses={courses} setCourses={setCourses} />
        ) : (
          <DashboardView courses={courses} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- styles ----------
const INK = '#1f4e5f';
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f5f4', paddingTop: 36 },
  title: { fontSize: 26, fontWeight: '700', color: INK, paddingHorizontal: 16 },
  switch: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 },
  content: { padding: 16, paddingTop: 4, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e1e6e4',
  },
  cardRisk: { borderColor: '#d9534f', borderWidth: 1.5 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1b2328', marginBottom: 6 },
  meta: { color: '#5b6770', fontSize: 13, marginTop: 4 },
  advice: { color: '#2e7d5b', fontSize: 13, marginVertical: 6, fontWeight: '500' },
  adviceBad: { color: '#c0392b' },
  pct: { fontSize: 20, fontWeight: '700' },
  pctGood: { color: '#2e7d5b' },
  pctBad: { color: '#c0392b' },
  big: { fontSize: 48, fontWeight: '700' },
  track: { height: 8, backgroundColor: '#e6ebe9', borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  fill: { height: 8, borderRadius: 4 },
  fillGood: { backgroundColor: '#2e7d5b' },
  fillBad: { backgroundColor: '#d9534f' },
  banner: { backgroundColor: '#fdecea', borderRadius: 10, padding: 12, marginBottom: 10 },
  bannerText: { color: '#a8321f', fontWeight: '600' },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1,
    borderColor: INK, marginRight: 8, marginBottom: 10,
  },
  chipActive: { backgroundColor: INK },
  chipText: { color: INK, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  btn_primary: { backgroundColor: INK },
  btn_secondary: { backgroundColor: '#e6ebe9' },
  btn_danger: { backgroundColor: '#fdecea' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnTextDark: { color: '#1b2328' },
  input: {
    borderWidth: 1, borderColor: '#cdd5d2', borderRadius: 10, padding: 10,
    marginBottom: 8, backgroundColor: '#fafcfb',
  },
  half: { flex: 1, marginRight: 8 },
  error: { color: '#c0392b', marginBottom: 6, fontSize: 13 },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: INK },
  chart: { borderRadius: 8, marginTop: 8 },
});

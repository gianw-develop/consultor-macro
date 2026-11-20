import topics from '../modules/annienexus/published-learning-topics.json';
import type {NoteRecord} from './notebook-backup';
const approvedTopics=new Set(topics);
// Legacy notes have only a topic, no course ID. Do not silently attribute
// ambiguous notes to Gregory. Filtering never alters storage or backup IDs.
export function visibleLearningNotes(notes:NoteRecord[]):NoteRecord[]{
 return notes.filter(n=>approvedTopics.has(n.topic)&&!/(?:hunab|junat|\bquantum\b|\bgex\b|\bgamma\b|\bopex\b|spotgamma|open interest|\bcollars?\b|flujo de opciones)/i.test(n.topic+' '+n.text));
}

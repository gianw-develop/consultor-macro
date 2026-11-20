"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibleLearningNotes = visibleLearningNotes;
const published_learning_topics_json_1 = __importDefault(require("../modules/annienexus/published-learning-topics.json"));
const approvedTopics = new Set(published_learning_topics_json_1.default);
// Legacy notes have only a topic, no course ID. Do not silently attribute
// ambiguous notes to Gregory. Filtering never alters storage or backup IDs.
function visibleLearningNotes(notes) {
    return notes.filter(n => approvedTopics.has(n.topic) && !/(?:hunab|junat|\bquantum\b|\bgex\b|\bgamma\b|\bopex\b|spotgamma|open interest|\bcollars?\b|flujo de opciones)/i.test(n.topic + ' ' + n.text));
}

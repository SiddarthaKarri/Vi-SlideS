import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    id?: string;
    teacherId: mongoose.Types.ObjectId;
    sessionCode: string;
    isActive: boolean;
    mood: string;
}

const SessionSchema: Schema = new Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionCode: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    mood: { type: String, default: 'neutral' },
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);

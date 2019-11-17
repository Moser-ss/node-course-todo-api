import mongoose from 'mongoose';
import { createSchema, Type, typedModel, ExtractDoc, ExtractProps } from 'ts-mongoose';

const TodoSchema = createSchema({
	text: Type.string({
		required: true,
		minlength: 1,
		trim: true,
	}),
	completed: Type.boolean({
		default: false,
	}),
	completedAt: Type.number({
		default: null,
	}),
	_creator: Type.objectId({
		require: true,
	}),
});

export const Todo = typedModel('Todo', TodoSchema);
export type TodoDoc = ExtractDoc<typeof TodoSchema>;
export type TodoProps = ExtractProps<typeof TodoSchema>;

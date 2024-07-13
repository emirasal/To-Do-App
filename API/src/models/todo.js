import { Schema, model } from 'mongoose';

const ToDoSchema = new Schema({
  user: {
    type: String,
    required: true
  },
  img: {
    type: String, 
    required: false,
  },
  file: {
    type: String,
    required: false,
  },
  todo: {
    type: String,
    required: true,
    unique: true
  },
});

export default model('Todo', ToDoSchema);

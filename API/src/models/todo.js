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
  tag: {
    type: String,
    required: false
  }
});

export default model('Todo', ToDoSchema);

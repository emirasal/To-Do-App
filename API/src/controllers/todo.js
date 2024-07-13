import Todo from "../models/todo.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllByEmail = async (req, res, next) => {
    const userEmail = req.params.email;

    try {
      const todos = await Todo.find({ user: userEmail });
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const add = async (req, res, next) => {
    const { user, todo } = req.body; 
    const img = req.files['thumbnail'] ? req.files['thumbnail'][0].filename : '';
    const file = req.files['file'] ? req.files['file'][0].filename : '';
    
    try {
        const newTodo = new Todo({
        user,
        img,
        file,
        todo
        });

        const savedTodo = await newTodo.save();

        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteById = async (req, res, next) => {
  const { _id } = req.body;

  try {
    const todoToDelete = await Todo.findById(_id);

    if (!todoToDelete) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (todoToDelete.img !== '') {
      const imgPath = path.join(__dirname, '../../uploads', todoToDelete.img);
      await fs.unlink(imgPath); 
    }

    if (todoToDelete.file !== '') {
      const filePath = path.join(__dirname, '../../uploads', todoToDelete.file);
      await fs.unlink(filePath);
    }
    await Todo.findByIdAndDelete(_id);

    res.status(200).json({ message: 'Todo and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo and files:', error);
    res.status(500).json({ message: error.message });
  }
};

export const editById = async (req, res, next) => {
  const { _id, newTodo } = req.body;

  try {
    const updatedTodo = await Todo.findOneAndUpdate(
      { _id, _id },
      { $set: newTodo },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadFile = async (req, res, next) => {
  try {
    
    const fileName = req.params.fileName;
    console.log("downloaddding:", fileName);
    
    const filePath = path.join(__dirname, '../../uploads/', fileName);
    console.log(filePath);
    res.download(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: 'File not found or error downloading' });
      }
    });
  } catch (error) {
    res.status(500).json({error});
  }
};

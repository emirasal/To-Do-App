import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MainPage.css';

const MainPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [newParameter, setNewParameter] = useState({ todo: '', file: null, thumbnail: null, tag: '' });
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageBaseUrl, setImageBaseUrl] = useState('http://localhost:8000/api/todo/downloadFile/');
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchParameters = async () => {
    try {
      let currentUser = localStorage.getItem('currentUser');
      currentUser = currentUser.replace(/"/g, '');
      const response = await axios.get(`http://localhost:8000/api/todo/getAllByEmail/${currentUser}`);
      console.log('Fetched parameters:', response.data);
      setParameters(response.data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/todo/getAllTags');
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagClick = async (tag) => {
    if (tag === selectedTag) {
      // Deselect the tag and fetch all parameters
      setSelectedTag(null);
      fetchParameters();
    } else {
      setSelectedTag(tag);
      try {
        const response = await axios.get(`http://localhost:8000/api/todo/getByTag/${tag}`);
        setParameters(response.data);
      } catch (error) {
        console.error('Error fetching parameters by tag:', error);
      }
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/todo/search/${searchTerm}`);
      setParameters(response.data);
    } catch (error) {
      console.error('Error searching parameters:', error);
    }
  };

  const addParameter = async () => {
    try {
      const currentUser = localStorage.getItem('currentUser').replace(/"/g, '');
      if (!newParameter.todo.trim()) {
        alert('Todo field cannot be empty.');
        return;
      }

      const formData = new FormData();
      formData.append('user', currentUser);
      formData.append('todo', newParameter.todo);
      formData.append('tag', newParameter.tag);

      if (newParameter.thumbnail) {
        formData.append('thumbnail', newParameter.thumbnail);
      }

      if (newParameter.file) {
        formData.append('file', newParameter.file);
      }

      await axios.post('http://localhost:8000/api/todo/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await fetchParameters();
      setNewParameter({ todo: '', file: null, thumbnail: null, tag: '' });
    } catch (error) {
      console.error('Error adding parameter:', error);
    }
  };

  const deleteParameter = async (parameter) => {
    try {
      await axios.delete('http://localhost:8000/api/todo/deleteById', {
        data: {
          _id: parameter._id,
        }
      });
      await fetchParameters();
    } catch (error) {
      console.error('Error deleting parameter:', error);
    }
  };

  const editParameter = (parameter) => {
    console.log(parameter);
    setEditMode(parameter._id);
    setParameters(parameters.map(p =>
      p._id === parameter._id ? { ...p, editData: { ...p } } : p
    ));
  };

  const handleEditChange = (id, field, value) => {
    setParameters(parameters.map(p =>
      p._id === id ? { ...p, editData: { ...p.editData, [field]: value } } : p
    ));
  };

  const submitEditParameter = async (parameter) => {
    try {
      const updatedParam = {
        _id: parameter._id,
        newTodo: {
          todo: parameter.editData.todo,
          tag: parameter.editData.tag
        }
      };
      await axios.put(`http://localhost:8000/api/todo/editById`, updatedParam);
      setEditMode(null);
      await fetchTags();
      await fetchParameters();
    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post('http://localhost:8000/api/auth/logout');
      localStorage.removeItem('currentUser');
      window.location.reload();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDownload = async (filename) => {
    const downloadUrl = `http://localhost:8000/api/todo/downloadFile/${filename}`;
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    fetchParameters();
    fetchTags();
  }, []);

  return (
    <div>
      <div className="header">
        <img src="logo.png" alt="Playable Factory" className="site-logo" />
        <img src="user.png" alt="User" onClick={toggleDropdown} className="user-icon" />
        {showDropdown && (
          <div className="dropdown">
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </div>
      <div className="content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>
        <div className="tags-container">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tag-button ${selectedTag === tag ? 'selected' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="parameter-container">
          <table className="parameter-table">
            <thead>
              <tr>
                <th className="parameter-thumbnail">Thumbnail</th>
                <th className="parameter-key">To-do</th>
                <th className="parameter-tag">Tag</th>
                <th className="parameter-file">File</th>
                <th className="parameter-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map(parameter => {
                return (
                  <tr key={parameter._id}>
                    {editMode === parameter._id ? (
                      <>
                        <td className="parameter-thumbnail">
                          {parameter.thumbnail ? <img src={parameter.thumbnail} alt="Thumbnail" /> : 'No image'}
                        </td>
                        <td className="parameter-key">
                          <input
                            type="text"
                            value={parameter.editData.todo}
                            onChange={e => handleEditChange(parameter._id, 'todo', e.target.value)}
                          />
                        </td>
                        <td className="parameter-tag">
                          <input
                            type="text"
                            value={parameter.editData.tag || ''}
                            onChange={e => handleEditChange(parameter._id, 'tag', e.target.value)}
                          />
                        </td>
                        <td className="parameter-file">
                          {parameter.file}
                          <button className="download-button" onClick={() => handleDownload(parameter.file)}>↓</button>
                        </td>
                        <td className="parameter-actions">
                          <button onClick={() => submitEditParameter(parameter)} className="submit-button">Submit</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="parameter-thumbnail">{parameter.thumbnail ? <img src={parameter.thumbnail} alt="Thumbnail" /> : 'No image'}</td>
                        <td className="parameter-key">{parameter.todo}</td>
                        <td className="parameter-tag">{parameter.tag || ''}</td>
                        <td className="parameter-file">
                          {parameter.file}
                          <button className="download-button" onClick={() => handleDownload(parameter.file)}>↓</button>
                        </td>
                        <td className="parameter-actions">
                          <div className="action-buttons">
                            <button onClick={() => editParameter(parameter)} className="edit-button">Edit</button>
                            <button onClick={() => {
                              console.log('Deleting parameter with _id:', parameter._id);
                              deleteParameter(parameter);
                            }} className="delete-button">Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="new-parameter-container">
          <h1>Add a new To-do</h1>
          <table className="parameter-table">
            <thead>
              <tr>
                <th className="parameter-thumbnail">Thumbnail</th>
                <th className="parameter-key">To-do</th>
                <th className="parameter-tag">Tag</th>
                <th className="parameter-file">File</th>
                <th className="parameter-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="parameter-thumbnail">
                  <input
                    type="file"
                    id="thumbnailUpload"
                    onChange={e => setNewParameter({ ...newParameter, thumbnail: e.target.files[0] })}
                  />
                </td>
                <td className="parameter-key">
                  <input
                    type="text"
                    id="todoInput"
                    value={newParameter.todo}
                    onChange={e => setNewParameter({ ...newParameter, todo: e.target.value })}
                    style={{ height: '20px', marginTop: '12px' }}
                    placeholder="Enter to-do"
                  />
                </td>
                <td className="parameter-tag">
                  <input
                    type="text"
                    id="tagInput"
                    value={newParameter.tag}
                    onChange={e => setNewParameter({ ...newParameter, tag: e.target.value })}
                    style={{ height: '20px', marginTop: '12px' }}
                    placeholder="Enter tag"
                  />
                </td>
                <td className="parameter-file">
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={e => setNewParameter({ ...newParameter, file: e.target.files[0] })}
                  />
                </td>
                <td className="parameter-actions">
                  <button onClick={addParameter} className="add-parameter-button">Add</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

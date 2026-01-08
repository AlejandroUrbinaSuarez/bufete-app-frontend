import { useState, useEffect } from 'react';
import { blogPostsApi, blogCategoriesApi } from '../../api/blog';
import { lawyersApi } from '../../api/services';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManageBlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [filters, setFilters] = useState({ status: '', search: '' });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    status: 'draft',
    author_id: '',
    category_ids: [],
    meta_title: '',
    meta_description: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, categoriesRes, lawyersRes] = await Promise.all([
        blogPostsApi.getAllAdmin(),
        blogCategoriesApi.getAll(),
        lawyersApi.getAllAdmin()
      ]);
      setPosts(postsRes.data.posts || postsRes.data);
      setCategories(categoriesRes.data);
      setLawyers(lawyersRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await blogPostsApi.getAllAdmin(filters);
      setPosts(response.data.posts || response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || '',
        content: post.content || '',
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        status: post.status || 'draft',
        author_id: post.author_id || '',
        category_ids: post.categories?.map(c => c.id) || [],
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || ''
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        featured_image: '',
        status: 'draft',
        author_id: lawyers[0]?.id || '',
        category_ids: [],
        meta_title: '',
        meta_description: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPost) {
        await blogPostsApi.update(editingPost.id, formData);
      } else {
        await blogPostsApi.create(formData);
      }
      handleCloseModal();
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el artículo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este artículo?')) return;

    try {
      await blogPostsApi.delete(id);
      fetchPosts();
    } catch (err) {
      setError('Error al eliminar el artículo');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await blogPostsApi.updateStatus(id, status);
      fetchPosts();
    } catch (err) {
      setError('Error al cambiar el estado');
    }
  };

  // Categorías
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCategory) {
        await blogCategoriesApi.update(editingCategory.id, categoryForm);
      } else {
        await blogCategoriesApi.create(categoryForm);
      }
      handleCloseCategoryModal();
      const res = await blogCategoriesApi.getAll();
      setCategories(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta categoría?')) return;

    try {
      await blogCategoriesApi.delete(id);
      const res = await blogCategoriesApi.getAll();
      setCategories(res.data);
    } catch (err) {
      setError('Error al eliminar la categoría');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-heading">Gestión del Blog</h1>
        <button
          onClick={() => activeTab === 'posts' ? handleOpenModal() : handleOpenCategoryModal()}
          className="btn-primary btn-sm"
        >
          + {activeTab === 'posts' ? 'Nuevo Artículo' : 'Nueva Categoría'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Artículos ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categorías ({categories.length})
          </button>
        </nav>
      </div>

      {/* Contenido de Posts */}
      {activeTab === 'posts' && (
        <>
          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input w-40"
            >
              <option value="">Todos los estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
              <option value="archived">Archivados</option>
            </select>
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input flex-1"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Autor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categorías</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vistas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No hay artículos. Haga clic en "Nuevo Artículo" para crear uno.
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt=""
                              className="w-12 h-12 rounded object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500">/{post.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.author?.full_name || 'Sin autor'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {post.categories?.map(cat => (
                            <span key={cat.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={post.status}
                          onChange={(e) => handleStatusChange(post.id, e.target.value)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="draft">Borrador</option>
                          <option value="published">Publicado</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(post)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Contenido de Categorías */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No hay categorías. Haga clic en "Nueva Categoría" para crear una.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenCategoryModal(category)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-heading">
                {editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Título *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Extracto</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="input"
                  rows={2}
                  maxLength={500}
                  placeholder="Breve resumen del artículo (aparece en listados)"
                />
              </div>

              <div>
                <label className="label">Contenido *</label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  className="bg-white"
                  style={{ minHeight: '300px' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="label">Autor *</label>
                  <select
                    name="author_id"
                    value={formData.author_id}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar autor</option>
                    {lawyers.map(lawyer => (
                      <option key={lawyer.id} value={lawyer.id}>{lawyer.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Imagen Destacada</label>
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="label">Categorías</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.category_ids.includes(category.id)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                  {categories.length === 0 && (
                    <span className="text-gray-500 text-sm">
                      No hay categorías. Créelas en la pestaña "Categorías".
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Meta Título</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="input"
                      maxLength={150}
                    />
                  </div>
                  <div>
                    <label className="label">Meta Descripción</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      className="input"
                      rows={2}
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : editingPost ? 'Actualizar' : 'Crear Artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-heading">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseCategoryModal} className="btn-ghost">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : editingCategory ? 'Actualizar' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogPage;

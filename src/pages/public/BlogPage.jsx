import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPostsApi, blogCategoriesApi } from '../../api/blog';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('categoria') || '';
  const currentPage = parseInt(searchParams.get('pagina')) || 1;
  const searchQuery = searchParams.get('buscar') || '';

  useEffect(() => {
    fetchData();
  }, [currentCategory, currentPage, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [postsRes, categoriesRes, recentRes] = await Promise.all([
        blogPostsApi.getAll({
          page: currentPage,
          limit: 9,
          category: currentCategory,
          search: searchQuery
        }),
        blogCategoriesApi.getAll(),
        blogPostsApi.getRecent(5)
      ]);

      setPosts(postsRes.data.posts || []);
      setPagination(postsRes.data.pagination || { page: 1, totalPages: 1 });
      setCategories(categoriesRes.data || []);
      setRecentPosts(recentRes.data || []);
    } catch (error) {
      console.error('Error cargando blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('categoria', slug);
    } else {
      params.delete('categoria');
    }
    params.delete('pagina');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('pagina', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('search');
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('buscar', query);
    } else {
      params.delete('buscar');
    }
    params.delete('pagina');
    setSearchParams(params);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Blog Legal | {SITE_NAME}</title>
        <meta name="description" content="Artículos y noticias sobre derecho, legislación y temas legales de interés." />
      </Helmet>

      {/* Hero */}
      <section className="bg-primary-900 text-white py-16">
        <div className="container-custom">
          <h1 className="text-white mb-4">Blog Legal</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Artículos, noticias y análisis sobre temas legales de actualidad escritos por nuestros expertos.
          </p>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Posts Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-500 text-lg">No se encontraron artículos.</p>
                  {(currentCategory || searchQuery) && (
                    <button
                      onClick={() => setSearchParams({})}
                      className="btn-primary mt-4"
                    >
                      Ver todos los artículos
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {posts.map((post) => (
                      <article key={post.id} className="card group">
                        {post.featured_image && (
                          <div className="aspect-video overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4">
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories?.map(cat => (
                            <span
                              key={cat.id}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-lg font-heading mb-2 line-clamp-2">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            {post.author?.photo_url ? (
                              <img
                                src={post.author.photo_url}
                                alt={post.author.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-600 text-sm font-medium">
                                  {post.author?.full_name?.charAt(0) || 'A'}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-600">
                              {post.author?.full_name || 'Autor'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(post.published_at)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Paginación */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.page === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-6">
              {/* Buscador */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-heading text-lg mb-4">Buscar</h3>
                <form onSubmit={handleSearch}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="search"
                      defaultValue={searchQuery}
                      placeholder="Buscar artículos..."
                      className="input flex-1"
                    />
                    <button type="submit" className="btn-primary px-4">
                      Buscar
                    </button>
                  </div>
                </form>
              </div>

              {/* Categorías */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-heading text-lg mb-4">Categorías</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        !currentCategory
                          ? 'bg-primary-100 text-primary-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Todas las categorías
                    </button>
                  </li>
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        onClick={() => handleCategoryChange(category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          currentCategory === category.slug
                            ? 'bg-primary-100 text-primary-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Posts Recientes */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-heading text-lg mb-4">Artículos Recientes</h3>
                <ul className="space-y-4">
                  {recentPosts.map(post => (
                    <li key={post.id}>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex gap-3 group"
                      >
                        {post.featured_image && (
                          <img
                            src={post.featured_image}
                            alt=""
                            className="w-16 h-16 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-medium group-hover:text-primary-600 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {formatDate(post.published_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-primary-900 text-white rounded-xl p-6">
                <h3 className="font-heading text-lg mb-2">¿Necesita Asesoría Legal?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Agende una consulta gratuita con nuestros expertos.
                </p>
                <Link to="/agendar-cita" className="btn-secondary w-full text-center">
                  Agendar Consulta
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPostsApi } from '../../api/blog';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Pedro Perez y Asociados';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await blogPostsApi.getBySlug(slug);
      setPost(response.data.post);
      setRelatedPosts(response.data.relatedPosts || []);
    } catch (error) {
      console.error('Error cargando artículo:', error);
      if (error.response?.status === 404) {
        navigate('/blog', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section">
        <div className="container-custom text-center">
          <h1 className="mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="btn-primary">
            Volver al Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title} | {SITE_NAME}</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || ''} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
      </Helmet>

      {/* Hero con imagen */}
      {post.featured_image && (
        <div className="relative h-[40vh] min-h-[300px] max-h-[500px] bg-primary-900">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900 via-primary-900/50 to-transparent" />
        </div>
      )}

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary-600">Inicio</Link>
              <span className="mx-2">/</span>
              <Link to="/blog" className="hover:text-primary-600">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>

            {/* Artículo */}
            <article className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-10">
                {/* Categorías */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories?.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/blog?categoria=${cat.slug}`}
                      className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-200 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                {/* Título */}
                <h1 className="text-3xl md:text-4xl font-heading mb-6">{post.title}</h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {post.author?.photo_url ? (
                      <img
                        src={post.author.photo_url}
                        alt={post.author.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 text-lg font-medium">
                          {post.author?.full_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{post.author?.full_name || 'Autor'}</div>
                      {post.author?.position && (
                        <div className="text-sm text-gray-500">{post.author.position}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-gray-600">
                    {formatDate(post.published_at)}
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-gray-600">
                    {post.views} visitas
                  </div>
                </div>

                {/* Contenido */}
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:font-heading prose-headings:text-primary-900
                    prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-lg prose-img:shadow-md
                    prose-blockquote:border-l-primary-500 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Autor bio */}
                {post.author?.bio && (
                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <h3 className="font-heading text-lg mb-4">Sobre el Autor</h3>
                    <div className="flex gap-4">
                      {post.author?.photo_url ? (
                        <img
                          src={post.author.photo_url}
                          alt={post.author.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-xl font-medium">
                            {post.author?.full_name?.charAt(0) || 'A'}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/equipo/${post.author?.slug || ''}`}
                          className="font-medium hover:text-primary-600"
                        >
                          {post.author.full_name}
                        </Link>
                        <p className="text-gray-600 text-sm mt-1">{post.author.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* CTA */}
            <div className="bg-primary-900 text-white rounded-xl p-8 mt-8 text-center">
              <h2 className="text-2xl font-heading text-white mb-3">¿Tiene Dudas Legales?</h2>
              <p className="text-gray-300 mb-6 max-w-lg mx-auto">
                Nuestros abogados están listos para ayudarle. Agende una consulta gratuita y obtenga asesoría personalizada.
              </p>
              <Link to="/agendar-cita" className="btn-secondary btn-lg">
                Agendar Consulta Gratuita
              </Link>
            </div>

            {/* Posts relacionados */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-heading mb-6">Artículos Relacionados</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.id} className="card group">
                      {relatedPost.featured_image && (
                        <div className="aspect-video overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-4">
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="font-heading text-lg mb-2 line-clamp-2">
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <div className="text-sm text-gray-500">
                        {formatDate(relatedPost.published_at)}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Navegación */}
            <div className="mt-8 text-center">
              <Link to="/blog" className="btn-outline">
                Ver Todos los Artículos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogPostPage;

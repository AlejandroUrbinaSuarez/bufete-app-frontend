import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiDocumentText, HiDownload, HiUpload, HiFolder,
  HiSearch, HiExternalLink
} from 'react-icons/hi';
import { casesApi } from '../../api/cases';

const DocumentsPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await casesApi.getMyCases();
      setCases(res.data || []);
    } catch (error) {
      console.error('Error cargando casos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (caseId, doc) => {
    try {
      const res = await casesApi.downloadDocument(caseId, doc.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Error al descargar');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCase) return;

    setUploading(true);
    try {
      await casesApi.uploadDocument(selectedCase.id, file);
      toast.success('Documento subido exitosamente');
      loadCases();
      setSelectedCase(null);
    } catch (error) {
      toast.error('Error al subir documento');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openUploadDialog = (caseItem) => {
    setSelectedCase(caseItem);
    fileInputRef.current?.click();
  };

  // Flatten all documents with case info
  const allDocuments = cases.flatMap(c =>
    (c.documents || []).map(doc => ({
      ...doc,
      caseId: c.id,
      caseNumber: c.case_number,
      caseTitle: c.title
    }))
  );

  // Group documents by case
  const documentsByCase = cases.map(c => ({
    ...c,
    documents: (c.documents || []).filter(doc =>
      doc.original_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(c => c.documents.length > 0 || !searchTerm);

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return 'text-red-500';
    if (['doc', 'docx'].includes(ext)) return 'text-blue-500';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-green-500';
    if (['xls', 'xlsx'].includes(ext)) return 'text-emerald-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading text-gray-900">Mis Documentos</h1>
          <p className="text-gray-600 mt-1">
            {allDocuments.length} documento{allDocuments.length !== 1 ? 's' : ''} en total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <HiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes casos activos</h3>
          <p className="text-gray-500">
            Los documentos aparecerán aquí cuando tengas casos asignados.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {documentsByCase.map((caseItem) => (
            <div key={caseItem.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Case Header */}
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <HiFolder className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <Link
                      to={`/portal/casos/${caseItem.id}`}
                      className="font-medium text-gray-900 hover:text-primary flex items-center"
                    >
                      {caseItem.title}
                      <HiExternalLink className="w-4 h-4 ml-1 opacity-50" />
                    </Link>
                    <p className="text-sm text-gray-500">{caseItem.case_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => openUploadDialog(caseItem)}
                  disabled={uploading}
                  className="btn-outline btn-sm flex items-center"
                >
                  <HiUpload className="w-4 h-4 mr-1" />
                  {uploading && selectedCase?.id === caseItem.id ? 'Subiendo...' : 'Subir'}
                </button>
              </div>

              {/* Documents List */}
              <div className="divide-y">
                {caseItem.documents.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <HiDocumentText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p>No hay documentos en este caso</p>
                  </div>
                ) : (
                  caseItem.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        <HiDocumentText className={`w-10 h-10 ${getFileIcon(doc.original_name)} flex-shrink-0`} />
                        <div className="ml-3 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {doc.original_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {doc.uploader && (
                              <span> · Subido por {doc.uploader.first_name} {doc.uploader.last_name}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleDownload(caseItem.id, doc)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                          title="Descargar"
                        >
                          <HiDownload className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {allDocuments.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4">Resumen</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{allDocuments.length}</p>
              <p className="text-sm text-gray-500">Total documentos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{cases.length}</p>
              <p className="text-sm text-gray-500">Casos</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {allDocuments.filter(d => d.original_name.endsWith('.pdf')).length}
              </p>
              <p className="text-sm text-gray-500">PDFs</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {allDocuments.filter(d => /\.(jpg|jpeg|png|gif)$/i.test(d.original_name)).length}
              </p>
              <p className="text-sm text-gray-500">Imágenes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;

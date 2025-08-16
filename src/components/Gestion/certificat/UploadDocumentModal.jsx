import { useState } from 'react';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import { CertificatService } from '../../../utils/CertificatService';

const UploadDocumentModal = ({ isOpen, onClose, certificatId }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [typeDocument, setTypeDocument] = useState('Certificat');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const allowedTypes = {
        'application/pdf': 'PDF',
        'image/jpeg': 'JPEG',
        'image/jpg': 'JPG',
        'image/png': 'PNG',
        'application/msword': 'DOC',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
    };

    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const validateFile = (file) => {
        if (!file) return 'Aucun fichier sélectionné';
        
        if (!allowedTypes[file.type]) {
            return 'Type de fichier non autorisé. Formats acceptés : PDF, JPG, JPEG, PNG, DOC, DOCX';
        }
        
        if (file.size > maxFileSize) {
            return 'Le fichier est trop volumineux. Taille maximum : 10MB';
        }
        
        return null;
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
        } else {
            setError('');
            setSelectedFile(file);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('typeDocument', typeDocument);

            await CertificatService.uploadDocument(certificatId, formData);
            
            // Réinitialiser le formulaire
            setSelectedFile(null);
            setTypeDocument('Certificat');
            setError('');
            
            onClose();
        } catch (error) {
            console.error('Erreur lors de l\'upload:', error);
            setError('Erreur lors de l\'upload du fichier');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setTypeDocument('Certificat');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Ajouter un document
                        </h2>
                        <p className="text-sm text-gray-500">
                            Téléchargez un document pour ce certificat
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Type de document */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de document
                    </label>
                    <select
                        value={typeDocument}
                        onChange={(e) => setTypeDocument(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="Certificat">Certificat</option>
                        <option value="Rapport d'audit">Rapport d'audit</option>
                        <option value="Document technique">Document technique</option>
                        <option value="Correspondance">Correspondance</option>
                        <option value="Autre">Autre</option>
                    </select>
                </div>

                {/* Zone de drop */}
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive
                            ? 'border-green-500 bg-green-50'
                            : selectedFile
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        onChange={handleFileInputChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={loading}
                    />

                    {selectedFile ? (
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto flex items-center justify-center">
                                <File className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)} • {allowedTypes[selectedFile.type]}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFile(null)}
                                className="text-sm text-red-600 hover:text-red-800"
                            >
                                Supprimer le fichier
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                <Upload className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-900">
                                    <span className="font-medium text-green-600">Cliquez pour télécharger</span>
                                    {' '}ou glissez-déposez
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PDF, JPG, PNG, DOC, DOCX jusqu'à 10MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Formats autorisés */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Formats autorisés :</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(allowedTypes).map((type) => (
                            <span
                                key={type}
                                className="px-2 py-1 bg-white text-xs text-gray-600 rounded border"
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        disabled={loading}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedFile || loading}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {loading ? 'Upload en cours...' : 'Télécharger'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UploadDocumentModal;
import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'

const supabase = createClient()

export interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
}

type UseSupabaseUploadOptions = {
  /**
   * Callback chamado quando o upload é completado com sucesso,
   * recebendo as URLs públicas dos arquivos
   */
  onUploadComplete?: (urls: string[]) => void
  /**
   * Nome do produto para usar como base para os nomes dos arquivos
   */
  productName?: string
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `test`, your file will be uploaded as `test/file_name`
   */
  path?: string
  /**
   * Indica se este é um upload temporário que será movido posteriormente
   * Arquivos temporários serão armazenados em /tmp/YYYY-MM-DD/
   */
  isTemporary?: boolean
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[]
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number
  /**
   * The number of seconds the asset is cached in the browser and in the Supabase CDN.
   *
   * This is set in the Cache-Control: max-age=<seconds> header. Defaults to 3600 seconds.
   */
  cacheControl?: number
  /**
   * When set to true, the file is overwritten if it exists.
   *
   * When set to false, an error is thrown if the object already exists. Defaults to `false`
   */
  upsert?: boolean
}

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>

const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const {
    bucketName,
    path,
    productName = '', // Nome do produto para usar como base para os nomes dos arquivos
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = Number.POSITIVE_INFINITY,
    cacheControl = 3600,
    upsert = false,
    isTemporary = true, // Por padrão, consideramos uploads como temporários
  } = options

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  const [successes, setSuccesses] = useState<string[]>([])

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true
    }
    return false
  }, [errors.length, successes.length, files.length])

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // Removida a filtragem de arquivos com nomes duplicados
      const validFiles = acceptedFiles
        .map((file) => {
          ;(file as FileWithPreview).preview = URL.createObjectURL(file)
          ;(file as FileWithPreview).errors = []
          return file as FileWithPreview
        })

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        ;(file as FileWithPreview).preview = URL.createObjectURL(file)
        ;(file as FileWithPreview).errors = errors
        return file as FileWithPreview
      })

      const newFiles = [...files, ...validFiles, ...invalidFiles]

      setFiles(newFiles)
    },
    [files, setFiles]
  )

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: Number.POSITIVE_INFINITY,
    multiple: true,
  })

  const onUpload = useCallback(async () => {
    setLoading(true)

    // [Joshen] This is to support handling partial successes
    // If any files didn't upload for any reason, hitting "Upload" again will only upload the files that had errors
    const filesWithErrors = errors.map((x) => x.name)
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files

    const responses = await Promise.all(
      filesToUpload.map(async (file, index) => {
        // Função para sanitizar nomes de arquivos (remover caracteres especiais)
        const sanitizeFileName = (name: string): string => {
          // Remove acentos
          const withoutAccents = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          // Substitui espaços e caracteres especiais por underscores
          return withoutAccents.replace(/[^a-zA-Z0-9.]/g, '_');
        };
        
        // Gera um caminho baseado na temporalidade do arquivo
        // Usa o nome do produto como base para o nome do arquivo
        const timestamp = Date.now();
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts.pop() || 'jpg';
        
        // Determina o nome base do arquivo
        let baseName;
        if (productName && productName.trim() !== '') {
          baseName = sanitizeFileName(productName.trim());
        } else {
          // Se o nome do produto estiver vazio, usa data e hora para garantir unicidade
          const now = new Date();
          const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
          const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
          baseName = `produto_${dateStr}_${timeStr}`;
        }
        
        // Adiciona o índice para diferenciar múltiplas fotos do mesmo produto
        const uniqueFileName = index === 0 
          ? `${baseName}.${extension}` 
          : `${baseName}_${index + 1}.${extension}`;
        
        let filePath = uniqueFileName;
        if (isTemporary) {
          // Se for temporário, coloca em tmp/YYYY-MM-DD/
          const today = new Date();
          const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
          filePath = `tmp/${dateStr}/${uniqueFileName}`;
        } else if (path) {
          // Se tiver um caminho específico e não for temporário
          filePath = `${path}/${uniqueFileName}`;
        }
        
        // Adiciona metadados para rastreamento
        const metadata = {
          uploadedAt: new Date().toISOString(),
          isTemporary: isTemporary ? 'true' : 'false'
        };
        
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: cacheControl.toString(),
            upsert,
            metadata
          })
        
        // Se o upload foi bem sucedido, gera a URL pública
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path)
          
          return { name: file.name, message: undefined, publicUrl }
        }
        if (error) {
          return { name: file.name, message: error.message }
        } else {
          return { name: file.name, message: undefined }
        }
      })
    )

    const responseErrors = responses.filter((x) => x.message !== undefined)
    // if there were errors previously, this function tried to upload the files again so we should clear/overwrite the existing errors.
    setErrors(responseErrors)

    const responseSuccesses = responses.filter((x) => x.message === undefined)
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)])
    )
    setSuccesses(newSuccesses)
    
    // Atualiza o campo imagens do formulário com as URLs públicas
    if (options.onUploadComplete) {
      const publicUrls = responseSuccesses
        .map((x) => x.publicUrl)
        .filter((url): url is string => url !== undefined)
      options.onUploadComplete(publicUrls)
    }

    setLoading(false)
  }, [files, path, bucketName, errors, successes])

  useEffect(() => {
    if (files.length === 0) {
      setErrors([])
    }

    // Removida a verificação de limite de arquivos
  }, [files.length, setFiles])

  // Função para resetar o estado de sucesso e permitir adicionar mais fotos
  const resetSuccess = useCallback(() => {
    setSuccesses([]);
  }, []);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    resetSuccess, // Nova função para resetar o estado de sucesso
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  }
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturn }
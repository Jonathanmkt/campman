'use client'

import { cn } from '@/lib/utils'
import { type UseSupabaseUploadReturn, type FileWithPreview } from '@/hooks/useSupabaseUpload/useSupabaseUpload'
import { Button } from '@/components/ui/button'
import { CheckCircle, File, GripVertical, Loader2, ImagePlus, Upload, X } from 'lucide-react'
import { createContext, type PropsWithChildren, useCallback, useContext } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'
) => {
  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (bytes === 0 || bytes === undefined) return size !== undefined ? `0 ${size}` : '0 bytes'
  const i = size !== undefined ? sizes.indexOf(size) : Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

type DropzoneContextType = Omit<UseSupabaseUploadReturn, 'getRootProps' | 'getInputProps'>

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined)

type DropzoneProps = UseSupabaseUploadReturn & {
  className?: string
  productName?: string
}

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.isSuccess
  const isActive = restProps.isDragActive
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0)

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            'border-2 border-gray-300 rounded-lg p-6 text-center bg-card transition-colors duration-300 text-foreground',
            className,
            isSuccess ? 'border-solid' : 'border-dashed',
            isActive && 'border-primary bg-primary/10',
            isInvalid && 'border-destructive bg-destructive/10'
          ),
        })}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  )
}
const SortableFile = ({ file, index, errors, successes, loading, onRemove, maxFileSize }: { 
  file: FileWithPreview
  index: number
  errors: { name: string; message: string }[]
  successes: string[]
  loading: boolean
  onRemove: (fileName: string) => void
  maxFileSize: number
}) => {
  const fileError = errors.find((e) => e.name === file.name)
  const isSuccessfullyUploaded = !!successes.find((e) => e === file.name)
  
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: file.name })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  const filePosition = index === 0 ? 'Foto principal' : `Foto ${index + 1}`
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="inline-flex gap-x-0.5 items-center py-2"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing pr-0 pl-0 py-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={18} />
      </div>
      

      
      {file.type.startsWith('image/') ? (
        <div className="relative h-40 w-40 rounded-lg border overflow-hidden shrink-0 bg-muted flex items-center justify-center group">
          <img src={file.preview} alt={file.name} className="object-cover w-full h-full" />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {filePosition}
          </div>
          {!loading && !isSuccessfullyUploaded && (
            <button
              type="button"
              onClick={() => onRemove(file.name)}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          )}
        </div>
      ) : (
        <div className="h-40 w-40 rounded-lg border bg-muted flex items-center justify-center">
          <File size={32} />
        </div>
      )}

      <div className="shrink grow flex flex-col items-start truncate">

        {!!fileError && (
          <p className="text-xs text-destructive">{fileError.message}</p>
        )}
      </div>


    </div>
  )
}

const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
    inputRef,
    resetSuccess
  } = useDropzoneContext()
  
  // Configura os sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Removido limite de arquivos

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName))
    },
    [files, setFiles]
  )
  
  // Manipula o fim do arrasto para reordenar os arquivos
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = files.findIndex((file) => file.name === active.id)
      const newIndex = files.findIndex((file) => file.name === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFiles = [...files]
        const [movedItem] = newFiles.splice(oldIndex, 1)
        newFiles.splice(newIndex, 0, movedItem)
        setFiles(newFiles)
      }
    }
  }, [files, setFiles])

  // Função para adicionar mais fotos após o upload bem-sucedido
  const handleAddMorePhotos = () => {
    // Resetar o estado de sucesso para voltar ao modo de edição
    resetSuccess();
    
    // Simular um clique no input para abrir o seletor de arquivos
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  if (isSuccess) {
    return (
      <div className={cn('flex flex-col w-full', className)}>
        <p className="text-primary text-sm mb-3 text-center">
          Imagens adicionadas com sucesso - Continue preenchendo o formulário
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {files.map((file, idx) => (
            <div key={file.name} className="relative group w-full max-w-[360px]">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border relative">
                <img 
                  src={file.preview} 
                  alt={file.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {idx === 0 ? "Foto principal" : `Foto ${idx + 1}`}
                </div>
                <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm">
                  <CheckCircle size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full mt-4">
          <Button
            variant="outline"
            onClick={handleAddMorePhotos}
            className="mx-auto block"
          >
            Adicionar mais fotos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-row flex-wrap gap-4', className)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={files.map((file) => file.name)}
          strategy={verticalListSortingStrategy}
        >
          {files.map((file, idx) => (
            <SortableFile
              key={file.name}
              file={file}
              index={idx}
              errors={errors}
              successes={successes}
              loading={loading}
              onRemove={handleRemoveFile}
              maxFileSize={maxFileSize}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {/* Card para adicionar mais fotos - só aparece quando já existem fotos */}
      {files.length > 0 && (
        <div className="inline-flex items-center py-2">
          <button 
            onClick={() => inputRef.current?.click()}
            className="relative h-40 w-40 rounded-lg border border-dashed flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            type="button"
          >
            <ImagePlus size={64} className="text-muted-foreground transition-colors duration-200 hover:text-primary" />
          </button>
        </div>
      )}
      {/* Removida validação de limite de arquivos */}
      {files.length > 0 && (
        <div className="w-full mt-4">
          <Button
            variant="outline"
            onClick={onUpload}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
            className="mx-auto block"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Concluir envio</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const { maxFiles, maxFileSize, inputRef, isSuccess, files } = useDropzoneContext()

  if (isSuccess || files.length > 0) {
    return null
  }

  return (
    <div className={cn('flex flex-col items-center gap-y-4', className)}>
      <button 
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer"
        type="button"
      >
        <ImagePlus size={64} className="text-muted-foreground transition-colors duration-200 hover:text-primary" />
      </button>
      <div className="flex flex-col items-center gap-y-1">
        <p className="text-xs text-muted-foreground">
          Arraste e solte suas fotos aqui ou clique no ícone acima para enviar
        </p>
      </div>
    </div>
  )
}

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext)

  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone')
  }

  return context
}

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext }
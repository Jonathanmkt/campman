import { ProductState } from "../types/produtos-types";

interface StepProgressProps {
  currentStep: ProductState;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  // Calcula o progresso baseado no passo atual (1 a 3)
  const progressPercentage = ((currentStep - 1) / 3) * 100;
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        <div className="flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <span className="text-xs mt-1">Bsico</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
          <span className="text-xs mt-1">Detalhes</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            3
          </div>
          <span className="text-xs mt-1">Adicional</span>
        </div>
      </div>
      
      <div className="w-full bg-muted h-2 rounded-full">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

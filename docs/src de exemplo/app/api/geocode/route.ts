import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { error: 'Endereço é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a chave de API está configurada
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key não configurada' },
        { status: 500 }
      );
    }
    
    // Fazer geocoding usando Google Maps API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=br&components=administrative_area:Rio de Janeiro|country:BR`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      // Filtrar apenas resultados do Rio de Janeiro
      const filteredResults = data.results.filter((result: any) => 
        result.formatted_address.toLowerCase().includes('rio de janeiro')
      );

      return NextResponse.json({
        success: true,
        results: filteredResults,
        status: data.status
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Geocoding falhou',
          status: data.status,
          error_message: data.error_message || 'Sem mensagem de erro específica'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro no servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

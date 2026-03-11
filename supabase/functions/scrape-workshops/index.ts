import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WorkshopData {
  luna: string
  personaj: string
  titlu: string
  descriere: string
  ce_invatam: string
  ce_primim: string
  imagine_url: string
  ordine: number
}

function parseWorkshops(html: string): WorkshopData[] {
  const workshops: WorkshopData[] = []
  const seen = new Set<string>()

  // Match each at__item div with data attributes
  const itemRegex = /data-workshop-title="([^"]*)"[^>]*data-workshop-month="([^"]*)"[^>]*data-workshop-description="([^"]*)"[^>]*data-workshop-image="([^"]*)"[^>]*data-workshop-learning="([^"]*)"[^>]*data-workshop-object-desc="([^"]*)"[^>]*data-workshop-character="([^"]*)"/g

  // Also try alternate attribute order
  const altRegex = /class="at__item[^"]*"[^>]*data-workshop-id="([^"]*)"[^>]*data-workshop-title="([^"]*)"[^>]*data-workshop-category="([^"]*)"[^>]*data-workshop-month="([^"]*)"[^>]*data-workshop-description="([^"]*)"[^>]*(?:data-workshop-age="[^"]*"[^>]*)?(?:data-workshop-duration="[^"]*"[^>]*)?(?:data-workshop-coordinators="[^"]*"[^>]*)?data-workshop-image="([^"]*)"[^>]*(?:data-workshop-pin="[^"]*"[^>]*)?(?:data-workshop-technology="[^"]*"[^>]*)?data-workshop-learning="([^"]*)"[^>]*(?:data-workshop-object="[^"]*"[^>]*)?data-workshop-object-desc="([^"]*)"[^>]*data-workshop-character="([^"]*)"/g

  let match
  let ordine = 0

  // Use a simpler approach: find all data-workshop-title occurrences and extract nearby attributes
  const blocks = html.split('data-workshop-id="')
  
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].substring(0, 3000) // Limit search area
    
    const getAttr = (name: string): string => {
      const re = new RegExp(`data-workshop-${name}="([^"]*)"`)
      const m = block.match(re)
      return m ? m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'") : ''
    }

    const titlu = getAttr('title')
    if (!titlu || seen.has(titlu)) continue
    seen.add(titlu)

    const luna = getAttr('month')
    const descriere = getAttr('description')
    let imagineRaw = getAttr('image')
    const ce_invatam = getAttr('learning')
    const ce_primim = getAttr('object-desc')
    const personaj = getAttr('character')

    // Resolve relative image URLs
    let imagine_url = imagineRaw
    if (imagine_url.startsWith('../')) {
      imagine_url = 'https://infodisplay.ro/' + imagine_url.replace('../', '')
    } else if (imagine_url.startsWith('/')) {
      imagine_url = 'https://infodisplay.ro' + imagine_url
    } else if (!imagine_url.startsWith('http')) {
      imagine_url = 'https://infodisplay.ro/' + imagine_url
    }
    // Fix URL encoding
    imagine_url = imagine_url.replace(/ /g, '%20')

    workshops.push({
      luna,
      personaj,
      titlu,
      descriere,
      ce_invatam,
      ce_primim,
      imagine_url,
      ordine: ordine++,
    })
  }

  return workshops
}

// Month order for sorting
const MONTH_ORDER: Record<string, number> = {
  'Ianuarie': 1, 'Februarie': 2, 'Martie': 3, 'Aprilie': 4,
  'Mai': 5, 'Iunie': 6, 'Iulie': 7, 'August': 8,
  'Septembrie': 9, 'Octombrie': 10, 'Noiembrie': 11, 'Decembrie': 12,
  'Saptamana Verde/Altfel': 13,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching infodisplay.ro/ateliere...')
    const response = await fetch('https://infodisplay.ro/ateliere', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InfoDisplayBot/1.0)',
        'Accept': 'text/html',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()
    console.log(`Fetched HTML: ${html.length} chars`)

    const workshops = parseWorkshops(html)
    console.log(`Parsed ${workshops.length} workshops`)

    if (workshops.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0, message: 'No workshops found in HTML' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sort by month order
    workshops.sort((a, b) => (MONTH_ORDER[a.luna] || 99) - (MONTH_ORDER[b.luna] || 99))
    workshops.forEach((w, i) => w.ordine = i)

    // Upsert into DB using service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase
      .from('external_workshops')
      .upsert(
        workshops.map(w => ({
          ...w,
          scraped_at: new Date().toISOString(),
          source_url: 'https://infodisplay.ro/ateliere',
        })),
        { onConflict: 'titlu' }
      )

    if (error) {
      console.error('Upsert error:', error)
      throw new Error(`DB upsert failed: ${error.message}`)
    }

    console.log(`Upserted ${workshops.length} workshops successfully`)

    return new Response(
      JSON.stringify({ success: true, count: workshops.length, workshops }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Scrape error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

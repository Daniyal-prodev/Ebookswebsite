export type Product = {
  id: string
  title: string
  author: string
  description: string
  price_cents: number
  categories: string[]
  age_group?: string
  cover_image_url?: string
  downloadable_asset_id?: string
  visible: boolean
  inventory?: number | null
  tags?: string[]
  featured?: boolean
  seo_title?: string | null
  seo_description?: string | null
  images?: string[]
  description_sections?: string[]
  sale_price_cents?: number | null
  discount_percent?: number | null
  created_at: string
  updated_at: string
}

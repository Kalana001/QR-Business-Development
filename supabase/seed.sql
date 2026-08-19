-- ============================================================================
-- QR Business Catalog — Sample Seed Data Script
-- ============================================================================

-- Note: Replace USER_ID with an actual auth.users UUID after sign-up, or run this
-- in the Supabase SQL Editor.

-- Example Business 1: Bella Vista Bistro (Restaurant)
INSERT INTO public.businesses (id, owner_id, name, slug, business_type, description, phone, email, address, currency, theme_color)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000', -- Placeholder Owner UUID
  'Bella Vista Bistro',
  'bella-vista-bistro',
  'restaurant',
  'Authentic Italian dining with fresh homemade pasta and artisanal pizzas.',
  '+1 (555) 234-5678',
  'contact@bellavistabistro.com',
  '123 Main Street, Suite A, Downtown',
  'USD',
  '#E11D48'
) ON CONFLICT (slug) DO NOTHING;

-- Categories for Restaurant
INSERT INTO public.categories (id, business_id, name, description, display_order) VALUES
('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Starters & Appetizers', 'Fresh beginnings', 1),
('10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Pasta & Mains', 'Traditional Italian hand-crafted pasta', 2),
('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Desserts', 'Sweet finish', 3)
ON CONFLICT DO NOTHING;

-- Items for Restaurant (No quantity shown)
INSERT INTO public.catalog_items (business_id, category_id, name, description, price, is_available, is_featured, badges) VALUES
('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000001', 'Bruschetta Originale', 'Grilled sourdough topped with vine tomatoes, garlic, extra virgin olive oil and fresh basil.', 12.50, true, true, ARRAY['Vegetarian', 'Popular']),
('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000002', 'Truffle Tagliolini', 'Handmade egg pasta with summer black truffle sauce and aged Parmigiano Reggiano.', 24.00, true, true, ARRAY['Chef Special']),
('11111111-1111-1111-1111-111111111111', '10000000-0000-0000-0000-000000000003', 'Classic Tiramisu', 'Savoiardi soaked in espresso with whipped mascarpone cream and dark cocoa.', 9.50, true, false, ARRAY['House Recipe'])
ON CONFLICT DO NOTHING;


-- Example Business 2: Page Turner Books (Bookshop)
INSERT INTO public.businesses (id, owner_id, name, slug, business_type, description, phone, email, address, currency, theme_color)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'Page Turner Books',
  'page-turner-books',
  'bookshop',
  'Independent bookshop specializing in rare finds, fiction, and coffee table art books.',
  '+1 (555) 987-6543',
  'hello@pageturnerbooks.com',
  '456 Literary Way, Arts District',
  'USD',
  '#0D9488'
) ON CONFLICT (slug) DO NOTHING;

-- Categories for Bookshop
INSERT INTO public.categories (id, business_id, name, description, display_order) VALUES
('20000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Fiction & Classics', 'Best-selling novels and timeless classics', 1),
('20000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Non-Fiction & Science', 'Biographies, history, and science', 2)
ON CONFLICT DO NOTHING;

-- Items for Bookshop (Author, ISBN, Quantity displayed)
INSERT INTO public.catalog_items (business_id, category_id, name, author, isbn, description, price, quantity, is_available, is_featured) VALUES
('22222222-2222-2222-2222-222222222222', '20000000-0000-0000-0000-000000000001', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'A story of ambition, obsession, and the American Dream in the Roaring Twenties.', 15.99, 14, true, true),
('22222222-2222-2222-2222-222222222222', '20000000-0000-0000-0000-000000000001', '1984', 'George Orwell', '9780451524935', 'A dystopian masterpiece on totalitarian regime and surveillance state.', 14.50, 0, true, false), -- Quantity 0 shows "Out of stock"
('22222222-2222-2222-2222-222222222222', '20000000-0000-0000-0000-000000000002', 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 'A groundbreaking narrative of humanity’s creation and evolution.', 18.00, 8, true, true)
ON CONFLICT DO NOTHING;


-- Example Business 3: Velvet & Blade Studio (Salon / Barber)
INSERT INTO public.businesses (id, owner_id, name, slug, business_type, description, phone, email, address, currency, theme_color)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'Velvet & Blade Studio',
  'velvet-and-blade',
  'salon',
  'Luxury hair styling, beard grooming, and spa treatment studio.',
  '+1 (555) 444-3322',
  'appointments@velvetandblade.com',
  '789 Style Boulevard, Suite 4',
  'USD',
  '#8B5CF6'
) ON CONFLICT (slug) DO NOTHING;

-- Categories for Salon
INSERT INTO public.categories (id, business_id, name, description, display_order) VALUES
('30000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Hair Styling & Cuts', 'Precision cuts and styling', 1),
('30000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'Beard & Grooming', 'Hot towel shaves and beard sculpts', 2)
ON CONFLICT DO NOTHING;

-- Items for Salon (Duration in minutes)
INSERT INTO public.catalog_items (business_id, category_id, name, duration, description, price, is_available, is_featured) VALUES
('33333333-3333-3333-3333-333333333333', '30000000-0000-0000-0000-000000000001', 'Executive Haircut & Wash', 45, 'Custom haircut including scalp massage, hot towel treatment, and styling product.', 55.00, true, true),
('33333333-3333-3333-3333-333333333333', '30000000-0000-0000-0000-000000000002', 'Royal Hot Towel Shave', 30, 'Traditional straight razor shave with pre-shave oils, warm lather, and cooling aftershave balm.', 40.00, true, true)
ON CONFLICT DO NOTHING;

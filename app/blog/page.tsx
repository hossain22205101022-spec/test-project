import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Blog | StyleFeed',
  description: 'Read the latest news and guides on our blog.',
};

export default async function BlogPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const q = searchParams?.query;
  const searchQuery = typeof q === 'string' ? q : '';

  let supabaseQuery = supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    supabaseQuery = (supabaseQuery as any).ilike('title', `%${searchQuery}%`);
  }

  const { data: blogs, error } = await supabaseQuery;

  if (error) {
    console.error('Error fetching blogs:', error);
  }

  const allBlogs = blogs || [];
  const featuredBlogs = allBlogs.slice(0, 3);
  const mainBlogsFirstRow = allBlogs.slice(3, 6);
  const mainBlogsSecondRow = allBlogs.slice(6, 9);
  const latestBlogs = allBlogs.slice(9, 12);

  const getCategory = (index: number) => {
    const cats = ['Health & Nutrition','Sustainability','Cultural Insights','Technology','Design','Lifestyle'];
    return cats[index % cats.length];
  };

  const CardGrid = ({ items, startIdx = 0 }: { items: typeof allBlogs; startIdx?: number }) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
      {items.map((blog, idx) => (
        <Link href={`/blog/${blog.slug}`} key={blog.id}
          className='group relative rounded-2xl overflow-hidden h-[420px] flex flex-col justify-end p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
          {blog.image_url ? (
            <img src={blog.image_url} alt={blog.title}
              className='absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' />
          ) : (<div className='absolute inset-0 bg-gray-800' />)}
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />
          <div className='relative z-10'>
            <span className='inline-block bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded mb-4 shadow-sm'>
              {getCategory(startIdx + idx)}
            </span>
            <h3 className='text-white text-xl font-bold mb-3 leading-tight line-clamp-3 group-hover:text-blue-200 transition-colors'>
              {blog.title}
            </h3>
            <p className='text-gray-300 text-sm line-clamp-2 leading-relaxed'>
              {blog.content.substring(0, 150).replace(/<[^>]+>/g, '')}{blog.content.length > 150 ? '...' : ''}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );

  const SidebarItem = ({ blog, prefix }: { blog: (typeof allBlogs)[0]; prefix: string }) => (
    <Link href={`/blog/${blog.slug}`} key={`${prefix}-${blog.id}`}
      className='flex gap-4 group items-center bg-white rounded-xl p-2 hover:bg-gray-50 transition-colors'>
      <div className='w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden relative shadow-sm'>
        {blog.image_url ? (
          <img src={blog.image_url} alt={blog.title}
            className='absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
        ) : (<div className='w-full h-full bg-gray-200' />)}
      </div>
      <div className='flex flex-col justify-center py-1 flex-grow'>
        <span className='text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide'>
          {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <h3 className='text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug'>
          {blog.title}
        </h3>
      </div>
    </Link>
  );

  return (
    <div className='min-h-screen bg-white'>
        <section className='flex flex-col items-center justify-center py-16 px-4'>
          <span className='bg-gray-100 text-gray-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6'>Blog</span>
          <h1 className='text-4xl md:text-5xl font-bold mb-6 text-center text-gray-900'>Discover our latest news</h1>
          <p className='text-gray-500 text-center max-w-2xl mb-8 text-lg leading-relaxed'>
            Discover the achievements that set us apart. From groundbreaking projects to industry accolades, we take pride in our accomplishments.
          </p>
          <form action='/blog' className='flex w-full max-w-lg gap-3'>
            <div className='relative flex-grow'>
              <svg className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <input type='text' name='query' defaultValue={searchQuery} placeholder='Search articles...'
                className='w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-900 bg-white' />
            </div>
            <button type='submit' className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-95 flex-shrink-0'>
              Find Now
            </button>
          </form>
        </section>

        <section className='px-4 max-w-7xl mx-auto pb-24'>
          {allBlogs.length === 0 ? (
            <div className='text-center py-20 text-gray-500 border rounded-2xl bg-gray-50'>No blog posts found.</div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-12'>
              <div className='lg:col-span-8'>
                <div className='flex items-center mb-8'>
                  <h2 className='text-2xl md:text-3xl font-bold mr-6 text-gray-900 whitespace-nowrap'>Whiteboards are remarkable.</h2>
                  <div className='flex-grow h-px bg-gray-200' />
                </div>
                <div className='flex flex-col gap-6'>
                  {mainBlogsFirstRow.length > 0 ? (
                    <CardGrid items={mainBlogsFirstRow} startIdx={3} />
                  ) : (
                    <CardGrid items={featuredBlogs} startIdx={0} />
                  )}
                  {mainBlogsSecondRow.length > 0 && <CardGrid items={mainBlogsSecondRow} startIdx={6} />}
                </div>
              </div>
              <div className='lg:col-span-4 mt-12 lg:mt-0'>
                <div className='flex items-center mb-8'>
                  <h2 className='text-2xl font-bold mr-6 text-gray-900'>Featured</h2>
                  <div className='flex-grow h-px bg-gray-200' />
                </div>
                <div className='flex flex-col gap-6 mb-12'>
                  {featuredBlogs.map((blog) => <SidebarItem key={blog.id} blog={blog} prefix='featured' />)}
                </div>
                {latestBlogs.length > 0 && (
                  <>
                    <div className='flex items-center mb-8'>
                      <h2 className='text-2xl font-bold mr-6 text-gray-900'>Latest</h2>
                      <div className='flex-grow h-px bg-gray-200' />
                    </div>
                    <div className='flex flex-col gap-6'>
                      {latestBlogs.map((blog) => <SidebarItem key={blog.id} blog={blog} prefix='latest' />)}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
    </div>
  );
}
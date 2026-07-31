const fs = require('fs');
const content = "import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: blog } = await supabase.from('blogs').select('title, content').eq('slug', params.slug).single();

  if (!blog) { return { title: 'Not Found | StyleFeed' }; }

  return {
    title: \\ | StyleFeed Blog\,
    description: (blog.content || '').substring(0, 150),
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: blog, error } = await supabase.from('blogs').select('*').eq('slug', params.slug).single();

  if (error || !blog) { notFound(); }

  const readingTime = Math.ceil((blog.content || '').split(' ').length / 200) || 1;

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 pt-10 lg:pt-16 pb-24'>
        {/* Back Link */}
        <Link href='/blog' className='inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-10'>
          <ChevronLeft className='w-4 h-4 mr-1' />
          Back to Blog
        </Link>

        {/* Header Section */}
        <div className='flex flex-col items-start mb-10'>
          <span className='inline-block bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full mb-6'>
            Article
          </span>
          <h1 className='text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.15] max-w-3xl'>
            {blog.title}
          </h1>
          
          <div className='flex flex-wrap items-center gap-6 text-gray-500 text-sm font-medium mt-2'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden'>
                <User className='w-4 h-4 text-gray-400' />
              </div>
              <span className='text-gray-900'>StyleFeed Team</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Calendar className='w-4 h-4 text-gray-400' />
              <time dateTime={blog.created_at}>
                {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
            <div className='flex items-center gap-1.5'>
              <Clock className='w-4 h-4 text-gray-400' />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {blog.image_url && (
          <div className='w-full rounded-[2rem] overflow-hidden mb-16 shadow-lg shadow-gray-200/50 bg-gray-100'>
            <img 
              src={blog.image_url} 
              alt={blog.title} 
              className='w-full h-auto min-h-[300px] md:h-[500px] object-cover hover:scale-[1.02] transition-transform duration-700'
            />
          </div>
        )}

        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Share Sidebar (Desktop Only) */}
          <div className='hidden lg:flex flex-col w-12 flex-shrink-0'>
            <div className='sticky top-32 flex flex-col gap-4 items-center'>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 origin-left -rotate-90 whitespace-nowrap mt-8'>SHARE</span>
              <button className='w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-white shadow-sm transition-all'>
                <Twitter className='w-4 h-4' />
              </button>
              <button className='w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-700 hover:border-blue-700 hover:bg-white shadow-sm transition-all'>
                <Facebook className='w-4 h-4' />
              </button>
              <button className='w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:bg-white shadow-sm transition-all'>
                <Linkedin className='w-4 h-4' />
              </button>
              <div className='h-8 w-px bg-gray-200 my-1'></div>
              <button className='w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 hover:bg-white shadow-sm transition-all'>
                <Share2 className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-grow min-w-0'>
            <article className='prose prose-lg sm:prose-xl max-w-none text-gray-600 prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl prose-img:shadow-lg prose-strong:text-gray-900 leading-relaxed mb-16'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {blog.content}
              </ReactMarkdown>
            </article>

            {/* Tags */}
            <div className='flex flex-wrap gap-2 mb-12'>
              <span className='px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium rounded-xl cursor-default'>Travel</span>
              <span className='px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium rounded-xl cursor-default'>Lifestyle</span>
              <span className='px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-sm font-medium rounded-xl cursor-default'>Inspiration</span>
            </div>

            <div className='h-px bg-gray-200 w-full my-12' />

            {/* Author Block */}
            <div className='flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-gray-50 p-8 rounded-[2rem]'>
               <div className='w-20 h-20 rounded-full bg-white flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm'>
                 <User className='w-8 h-8 text-gray-400' />
               </div>
               <div className='text-center sm:text-left'>
                 <h3 className='text-xl font-bold text-gray-900 mb-2'>StyleFeed Team</h3>
                 <p className='text-gray-600 text-base leading-relaxed mb-4'>
                   We are passionate about helping you discover the latest trends in fashion, travel, and lifestyle. Follow our updates to stay ahead of the curve.
                 </p>
                 <Link href='/blog' className='inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors'>
                   Read more articles &rarr;
                 </Link>
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

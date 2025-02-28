// Define specific interfaces for each testimonial type
interface BaseTestimonial {
  type: "audio" | "video";
  author: string;
  title: string;
}

interface AudioTestimonial extends BaseTestimonial {
  type: "audio";
  audio: string;
  backgroundImage: string;
  followers?: string; // Optional for audio testimonials
}

interface VideoTestimonial extends BaseTestimonial {
  type: "video";
  video: string;
  followers?: string; // Optional for video testimonials
  backgroundImage?: string; // Optional for video testimonials
}

// Union type for all testimonial types
type Testimonial = AudioTestimonial | VideoTestimonial;

// Export the testimonials array with the correct type
export const TESTIMONIALS: Testimonial[] = [
  {
    type: "audio",
    author: "Carl Weisty",
    title: "Live on KFM Radio",
    audio:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Testimonials%20KFM%20Voice%20Note/Carl-Weisty%20KFM%20Interview-1qzRvirx5KB9zLKLsIqzShmxOjDqEW.mp3",
    backgroundImage:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Testimonials%20KFM%20Voice%20Note/carl%20weisty-9yDyPlbroSm0JFx88YzTzcKvipNBL7.jpg",
  },
  {
    type: "video",
    author: "Siv Ngesi",
    title: "Actor & TV Personality",
    followers: "145K",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Testimonials%20Videos/Siv%20Ngesi/Siv%20Ngesi-6tNclqxEF8Y0oTMAcx4m285rOKFS38.mp4",
  },
  {
    type: "video",
    author: "eats_with_thando",
    title: "Food Blogger & Content Creator",
    followers: "97.2K",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Testimonials%20Videos/eats_with_thando-q7Bm65PHJM6Ruq54hnQJr3jQtuMr2V.mov",
  },
  {
    type: "video",
    author: "hush_in_my_kitchen",
    title: "Cooking Instructor, Content Creator, Caterer",
    followers: "27K",
    video:
      "https://xbutpndzgqpjnjst.public.blob.vercel-storage.com/Testimonials%20Videos/Hush%20in%20my%20kitchen-FJuCz7KBzJKr5IgYkYLAYLja8V4qtm.mp4",
  },
];

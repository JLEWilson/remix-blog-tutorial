import type { LoaderFunction, ActionFunction } from "remix";
import { Form, useLoaderData, json, useActionData, redirect } from "remix";
import invariant from "tiny-invariant";

import type { Post } from "~/models/post.server";
import { getPost, updatePost} from "~/models/post.server";

type LoaderData = { post: Post };

export const loader: LoaderFunction = async ({
  params,
}) => {
  invariant(params.slug, `params.slug is required`);
  
  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);
  
  return json<LoaderData>({ post });
};

type ActionData = 
| {
  startSlug: null | string;
  title: null | string;
  slug: null | string;
  markdown: null | string;
}
| undefined;

export const action: ActionFunction = async ({ 
  request, 
}) => {
  const formData = await request.formData();
  
  const startSlug = formData.get("startSlug")
  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  
  const errors: ActionData = {
    startSlug: startSlug ? null : "no initial slug",
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage
  );
  if(hasErrors){
    console.log(errors);
    return json<ActionData>(errors);
  }

  invariant(
    typeof startSlug === "string",
    "slug must be a string"
  );
  invariant(
    typeof title === "string",
    "title must be a string"
  );
  invariant(
    typeof slug === "string",
    "slug must be a string"
  );
  invariant(
    typeof markdown === "string",
    "markdown must be a string"
  );

  await updatePost( startSlug ,{title, slug, markdown});

  return redirect("/posts/admin");
}

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;
export default function EditSlug() {
  const { post } = useLoaderData() as LoaderData;
  const errors  = useActionData();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Editing: {post.slug}
      </h1>
      <Form method="post">
      {errors?.startSlug ? (
        <em className="text-red-600">{errors.startSlug}</em>
      ): null}
      <input type="hidden"
        name="startSlug"
        value={post.slug}
      />
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
            ) : null}
          <input
            type="text"
            name="title"
            placeholder={post.title}
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            placeholder={post.slug}
            className={inputClassName}
          />
        </label>
      </p>
      <p>
      <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">
              {errors.markdown}
            </em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          placeholder={post.markdown}
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          Create Post
        </button>
      </p>
    </Form>
    </main>
  )
}
import { Link } from "@heroui/link";
// import { Snippet } from "@heroui/snippet";
// import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
// import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Manage your&nbsp;</span>
          <span className={title({ color: "violet" })}>identities&nbsp;</span>
          <br />
          <span className={title()}>
            and profiles from one centralised platform.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
            Build unique personas for different social settings.
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
            href={siteConfig.links.login}
          >
            How it works
          </Link>
          <Link
            // isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            // href={siteConfig.links.github}
          >
            {/* <GithubIcon size={20} /> */}
            Register
          </Link>
        </div>

        {/* <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Get started by editing{" "}
              <Code color="primary">pages/index.tsx</Code>
            </span>
          </Snippet>
        </div> */}
      </section>
    </DefaultLayout>
  );
}

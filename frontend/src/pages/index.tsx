import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

import RotatingText from "@/blocks/TextAnimations/RotatingText/RotatingText";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>Manage
            {/* <span className={title({ color: "violet"})}> */}
            <RotatingText
              texts={['your identity', 'your audience', 'your personas']}
              mainClassName="px-2 sm:px-2 md:px-3 text-blue-500 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
              staggerFrom={"last"}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
          </span>
          <hr className="my-5 border-1" />
          <span className={title({ size: "sm" })}>
            All in one centralised platform.
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
            href={siteConfig.links.about}
          >
            How it works
          </Link>

          <Link
            href={"/login"}
            className={buttonStyles({ variant: "bordered", radius: "full" })}
          >
            Login
          </Link>
          <Link
            href={"/register"}
            className={buttonStyles({ variant: "bordered", radius: "full" })}
          >
            Register
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}

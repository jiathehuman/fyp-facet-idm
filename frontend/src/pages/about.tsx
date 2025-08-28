import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import Stepper, { Step } from "@/blocks/Components/Stepper/Stepper";
  import { useNavigate } from 'react-router-dom';

export default function DocsPage() {
    const navigate = useNavigate()
    return (
        <DefaultLayout>
            <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>How it works</h1>
                    <p className="text-justify mt-5">Facets is a powerful <span className="text-violet-600 font-bold">meta-database</span> that transforms the way you <span className="text-violet-600 font-bold">manage</span> and <span className="text-violet-600 font-bold">share</span> information. With Facets, you can design dynamic <span className="text-violet-600 font-bold">personas</span> that represent the precise you would like to show an audience. </p>
                    <p className="text-justify my-5"> Seamlessly <span className="text-violet-600 font-bold">control access</span> by exposing these personas only to authorized clients, ensuring both security and personalisation at scale. Facets provides a trusted foundation for structured, secure, and intelligent personal-information sharing.</p>
                    <h2 className={title()}>Steps</h2>
                    <div>
                        <Stepper
                            initialStep={1}
                            onStepChange={(step) => {
                                console.log(step);
                            }}
                            onFinalStepCompleted={() => {navigate('/register')}}
                            backButtonText="Previous"
                            nextButtonText="Next"
                        >
                            <Step>
                                <h2 className="text-xl text-violet-700">Step 1: Define your info</h2>
                                <div className="">
                                    <p>Name: John Doe</p>
                                    <p>Nickname: J.D.</p>
                                    <p>Occupation: Software Engineer</p>
                                </div>
                            </Step>
                            <Step>
                                <h2 className="text-xl text-violet-700">Step 2: Create a persona</h2>
                                {/* <img style={{ height: '100px', width: '100%', objectFit: 'cover', objectPosition: 'center -70px', borderRadius: '15px', marginTop: '1em' }} src="https://www.purrfectcatgifts.co.uk/cdn/shop/collections/Funny_Cat_Cards_640x640.png?v=1663150894" /> */}
                                <p>Persona: Professional</p>
                                <p>Persona: Social</p>
                            </Step>
                            <Step>
                                <h2 className="text-xl text-violet-700">Step 3: Assign info to persona</h2>
                                {/* <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name?" /> */}
                                <p className="font-bold mt-3">Persona: Social</p>
                                <p>Name: John Doe</p>
                                <p>Nickname: J.D.</p>
                            </Step>
                            <Step>
                                <h2 className="text-xl text-violet-700">Final Step</h2>
                                <p>Generate an API Key for the persona endpoint to provide access to a client of your chosing!</p>
                            </Step>
                        </Stepper>
                    </div>
                </div>
            </section>
        </DefaultLayout>
    );
}

import DefaultLayout from '@/layouts/DefaultLayout';
import React, { ReactNode } from 'react';
import { Link, Heading, Text } from '@chakra-ui/react';

const AboutPage = (): ReactNode => (
    <DefaultLayout title="About | Daan Debie">
        <Heading as="h1" size="2xl">
            About Me
        </Heading>

        <Text fontSize="lg">
            Hi there! I‘m Daan Debie. I‘m a social firestarter and technology leader with a strong
            and long background in Software and Data Engineering. It is working with people and
            working on things that matter, that I love the most.
        </Text>
        <Text fontSize="lg">
            I found an amazing challenge at{' '}
            <Link href="https://source.ag" isExternal>
                Source.ag
            </Link>{' '}
            where I currently work as VP of Engineering, helping to accelerate the global transition
            to sustainable agriculture with A.I. powered greenhouses.
        </Text>
        <Text fontSize="lg">
            I live in a small coastal town in The Netherlands with my lovely wife, our beautiful{' '}
            <Link href="https://www.instagram.com/p/BdYpuOCnX9f/" isExternal>
                Maine Coon
            </Link>{' '}
            and an energetic Golden Retriever pup. I really love long walks on the beach. But I‘m
            also very happy staying indoors reading books, watching movies and tv-shows and playing
            games.
        </Text>

        <Heading as="h2" size="xl">
            Background
        </Heading>
        <Text fontSize="lg">
            I followed a somewhat peculiar career path, getting a Bachelors degree in Music &amp;
            Performance and working as a pianist, composer, arranger and band leader first, before
            changing focus and getting a Computer Engineering degree.
        </Text>
        <Text fontSize="lg">
            Since then, I have accumulated extensive experience developing complex systems and
            interesting products. I helped teams and organisations achieve{' '}
            <em>technological excellence</em> through a balance of cutting edge tech and pragmatism.
        </Text>
        <Text fontSize="lg">
            On top of my experience as a Software craftsman, I‘ve also developed an interest in data
            engineering & distributed computing, containerization (Docker, Kubernetes et al.) and
            programmable infrastructure.
        </Text>
        <Text fontSize="lg">
            My languages of choice are Scala, Python and Typescript and I‘m fluent in Java and
            Clojure as well. But I believe in using the right tool for the job and encourage my
            teams to keep exploring new languages and tools to bring their products to the next
            level.
        </Text>
    </DefaultLayout>
);

export default AboutPage;

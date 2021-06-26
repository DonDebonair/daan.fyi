import React, { ReactNode, useState } from 'react';
import Link from 'next/link';

type Props = {
    children?: ReactNode;
};

const Layout = ({ children }: Props) => {
    const [counter, setCounter] = useState(0);
    return (
        <div>
            <header>
                <nav>
                    <Link href="/">
                        <a>Home</a>
                    </Link>{' '}
                    |{' '}
                    <Link href="/about">
                        <a>About</a>
                    </Link>{' '}
                    |{' '}
                    <Link href="/users">
                        <a>Users List</a>
                    </Link>
                </nav>
            </header>
            <button onClick={() => setCounter(counter + 1)}>Clicked {counter} Times</button>
            {children}
            <footer>
                <hr />
                <span>I'm here to stay (Footer)</span>
            </footer>
        </div>
    );
};

export default Layout;

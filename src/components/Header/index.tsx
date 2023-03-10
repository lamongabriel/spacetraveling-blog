import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <div className={commonStyles.container}>
        <Link href="/">
          <img src="/logo.png" alt="logo" />
        </Link>
      </div>
    </header>
  );
}

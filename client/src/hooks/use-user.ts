import { User } from '@/types/user';
import * as React from 'react';

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	loading: boolean;
	reload: () => Promise<void>;
}

const UserContext = React.createContext<UserContextType | undefined>(undefined);

const useUser = (): UserContextType => {
	const context = React.useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};

export { UserContext, useUser };

import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const fadeConfig = {
    animation: 'timing',
    config: {
        duration: 300,
    },
};

const forFade = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

export default function FadeStackNavigator({ component, params }) {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: forFade,
                transitionSpec: {
                    open: fadeConfig,
                    close: fadeConfig,
                },
            }}
        >
            <Stack.Screen
                name="FadeScreen"
                component={component}
                initialParams={params}
            />
        </Stack.Navigator>
    );
}
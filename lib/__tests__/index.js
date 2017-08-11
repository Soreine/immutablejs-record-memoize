import test from 'ava';
import sinon from 'sinon';
import { Record } from 'immutable';
import memoize from '../';

test('Should memoize methods on an object', (t) => {
    function TestObject() {}
    TestObject.prototype = {
        methodNoArgs() {
            return 'noargs';
        },

        methodArgs(a, b, c) {
            return a + b + c;
        }
    };

    // Spy the methods
    sinon.spy(TestObject.prototype, 'methodArgs');
    sinon.spy(TestObject.prototype, 'methodNoArgs');
    const { methodNoArgs, methodArgs } = TestObject.prototype;

    // Memoize
    memoize(TestObject.prototype, ['methodArgs'], { takesArguments: true });
    memoize(TestObject.prototype, ['methodNoArgs'], { takesArguments: false });

    // Test
    const instance = new TestObject();

    // first call
    t.is(instance.methodNoArgs(), 'noargs');
    t.true(methodNoArgs.calledOnce);
    t.true(methodNoArgs.calledOn(instance));

    // second call
    t.is(instance.methodNoArgs(), 'noargs');
    t.true(methodNoArgs.calledOnce);

    // first call
    t.is(instance.methodArgs(1, 2, 3), 6);
    t.true(methodArgs.calledOnce);
    t.true(methodArgs.calledOn(instance));
    t.deepEqual(methodArgs.getCall(0).args, [1, 2, 3]);

    // second call
    t.is(instance.methodArgs(1, 2, 3), 6);
    t.true(methodArgs.calledOnce);

    // Third call, different arguments
    t.is(instance.methodArgs(1, 1, 1), 3);
    t.is(methodArgs.callCount, 2);
    t.deepEqual(methodArgs.getCall(1).args, [1, 1, 1]);
    t.is(instance.methodArgs(1, 1, 1), 3);
    t.is(methodArgs.callCount, 2);
});

test('Should memoize methods on an ImmutableJS.Record', (t) => {
    class TestRecord extends Record({}) {
        methodNoArgs() {
            return 'noargs';
        }
        methodArgs(a, b, c) {
            return a + b + c;
        }
    }

    // Spy the methods
    sinon.spy(TestRecord.prototype, 'methodArgs');
    sinon.spy(TestRecord.prototype, 'methodNoArgs');
    const { methodNoArgs, methodArgs } = TestRecord.prototype;

    // Memoize
    memoize(TestRecord.prototype, ['methodArgs'], { takesArguments: true });
    memoize(TestRecord.prototype, ['methodNoArgs'], { takesArguments: false });

    // Test
    const instance = new TestRecord();

    // first call
    t.is(instance.methodNoArgs(), 'noargs');
    t.true(methodNoArgs.calledOnce);

    // second call
    t.is(instance.methodNoArgs(), 'noargs');
    t.true(methodNoArgs.calledOnce);

    // first call
    t.is(instance.methodArgs(1, 2, 3), 6);
    t.true(methodArgs.calledOnce);
    t.deepEqual(methodArgs.getCall(0).args, [1, 2, 3]);

    // second call
    t.is(instance.methodArgs(1, 2, 3), 6);
    t.true(methodArgs.calledOnce);

    // Third call, different arguments
    t.is(instance.methodArgs(1, 1, 1), 3);
    t.is(methodArgs.callCount, 2);
    t.deepEqual(methodArgs.getCall(1).args, [1, 1, 1]);
    t.is(instance.methodArgs(1, 1, 1), 3);
    t.is(methodArgs.callCount, 2);
});

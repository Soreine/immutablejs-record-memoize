import test from 'ava';
import sinon from 'sinon';
import { Record } from 'immutable';
import memoize from '../';

function testOn(t, object) {
    // Spy the methods
    sinon.spy(object.prototype, 'methodArgs');
    sinon.spy(object.prototype, 'methodNoArgs');
    const { methodNoArgs, methodArgs } = object.prototype;

    // Memoize
    memoize(object.prototype, ['methodArgs', 'methodNoArgs']);

    // Test
    const instance = new object();

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
}

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

    testOn(t, TestObject);
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

    testOn(t, TestRecord);
});
